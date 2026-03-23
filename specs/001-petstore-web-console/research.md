# Research: Petstore Web Console

**Feature**: 001-petstore-web-console  
**Date**: 2026-03-22  
**Status**: Complete

## API Surface Analysis

The Petstore OpenAPI 3.0.4 spec (v1.0.27) exposes **3 resource groups** (pet, store, user) across **~19 endpoints** with **5 domain schemas** (Pet, Order, User, Category, Tag). Authentication uses OAuth2 implicit flow (`petstore_auth`) and API key (`api_key`). The API is straightforward CRUD with filtering (by status, tags), image upload, and inventory aggregation.

---

## Decision 1: Framework

**Decision**: React 19 + Vite 6  
**Rationale**: This is a pure SPA consuming an external REST API — no SSR, no SEO (staff-facing console behind login), no server component benefits. Vite provides sub-2-second dev server startup, millisecond HMR, and small production bundles. The simpler mental model (no server/client boundary) is easier to maintain.  
**Alternatives considered**:

- **Next.js 15**: Adds SSR/RSC complexity with no benefit for a login-gated internal SPA. Larger bundle, more deployment overhead.
- **Vue 3 + Vite**: Excellent framework but smaller talent pool and component ecosystem compared to React.
- **SvelteKit**: Smallest community, fewest enterprise component libraries. Higher hiring risk.

---

## Decision 2: UI Component Library

**Decision**: shadcn/ui (built on Radix UI primitives + Tailwind CSS)  
**Rationale**: Provides ~76 high-quality, accessible components as owned source code. Zero vendor lock-in, complete customization control, and zero additional bundle weight. Pairs naturally with Tailwind CSS. Dominant approach for new React projects.  
**Alternatives considered**:

- **Ant Design**: ~500KB+ bundle, opinionated design language, CSS-in-JS creates friction with Tailwind.
- **MUI (Material UI)**: ~300KB+ bundle, complex theming API. Material Design aesthetic can look generic.
- **Mantine**: Good DX but smaller ecosystem.

---

## Decision 3: HTTP Client / API Layer

**Decision**: Orval v8 for OpenAPI client generation, outputting TanStack Query hooks  
**Rationale**: Orval reads the Petstore OpenAPI spec and auto-generates fully typed TypeScript API functions *and* TanStack Query hooks in one step. Provides type-safe request/response types, automatic Zod validation schemas, MSW mock handlers for testing, and zero hand-written fetch boilerplate. When the API spec changes, regenerate and the compiler shows every broken call site.  
**Alternatives considered**:

- **openapi-ts**: Slower generation, less active development, no native TanStack Query hook output.
- **openapi-typescript-codegen**: Lower activity, fewer integrations.
- **Manual fetch wrapper**: Loses type safety from the spec and free mock generation. Not worth the maintenance burden for 19 endpoints.

---

## Decision 4: Form Handling

**Decision**: React Hook Form v7 + Zod resolver  
**Rationale**: Uses uncontrolled inputs with minimal re-renders — critical for snappy UX for non-technical users. ~9KB gzipped with zero dependencies. Zod integration means form validation schemas match API types (Orval generates Zod schemas from OpenAPI spec).  
**Alternatives considered**:

- **Formik**: Controlled-input model causes re-renders on every keystroke, 44.7KB bundle, stagnated development.
- **TanStack Form**: Still maturing, ~500K downloads. Worth revisiting.

---

## Decision 5: State Management

**Decision**: TanStack Query v5 (server state) + Zustand v5 (client state)  
**Rationale**: ~90% of the app's state is server data (pets, orders, inventory, users) — TanStack Query handles all of it with automatic caching, background refetching, deduplication, loading/error states, and optimistic updates. Remaining client state (auth session, sidebar toggle, filter preferences) is tiny and fits in Zustand's ~1KB store. Orval generates TanStack Query hooks directly, unifying the API and state layers.  
**Alternatives considered**:

- **Redux Toolkit**: Massive boilerplate for a 10-screen app. RTK Query less feature-complete than TanStack Query.
- **Jotai**: Good atomic state library, but Zustand's store model is simpler for a small team.
- **SWR**: Less feature-complete than TanStack Query (no optimistic updates, weaker devtools).

---

## Decision 6: Testing

**Decision**: Vitest v3 (unit/integration) + React Testing Library (components) + Playwright (E2E)  
**Rationale**: Vitest is 2-4x faster than Jest for TypeScript/ESM projects, shares Vite's esbuild pipeline. API is 95% Jest-compatible. React Testing Library is the standard for component testing. Playwright has 80%+ market share for new E2E, replacing Cypress with better multi-tab support and less flakiness. Orval's MSW mock generation provides a free mock server for integration tests.  
**Alternatives considered**:

- **Jest**: Needs separate TypeScript/ESM configuration for a Vite project.
- **Cypress**: Declining; slower, single-tab limitation, commercial pricing for dashboard.

---

## Decision 7: CSS Approach

**Decision**: Tailwind CSS v4  
**Rationale**: CSS-native configuration and Rust-based engine (10x faster builds). Natural pairing with shadcn/ui. Responsive utilities (`md:`, `lg:`) make desktop+tablet layout trivial. Utility-first approach eliminates context switching and enforces design consistency.  
**Alternatives considered**:

- **CSS Modules**: Requires separate CSS files, loses rapid iteration benefit of utility classes.
- **styled-components / Emotion**: Runtime CSS-in-JS in decline due to cold-start overhead and bundle size.

---

## Decision 8: Routing

**Decision**: React Router v7  
**Rationale**: Mature, widely adopted, supports nested layouts and data loading. Well-documented for SPA applications. The Petstore console has a simple route structure (~8-10 routes) that doesn't require advanced features like type-safe routing.  
**Alternatives considered**:

- **TanStack Router**: Type-safe routing is excellent but adds learning curve. Worth considering for larger apps.

---

## Decision 9: Authentication

**Decision**: react-oidc-context (wraps oidc-client-ts)  
**Rationale**: The Petstore spec defines OAuth2 implicit flow, but implicit flow is deprecated per current security best practices. The implementation should use **Authorization Code with PKCE** instead. `react-oidc-context` provides React hooks for auth state and handles token refresh, session management, and secure storage.  
**Alternatives considered**:

- **Manual token management**: Error-prone, reinvents the wheel for PKCE flow, token refresh, and session expiry detection.

---

## Dependency Footprint Estimate

| Package | Gzipped Size |
|---------|-------------|
| React + ReactDOM | ~44KB |
| React Router | ~14KB |
| TanStack Query | ~12KB |
| React Hook Form | ~9KB |
| Zustand | ~1KB |
| Zod | ~13KB |
| shadcn/ui components | ~0KB (local source) |
| Tailwind CSS | ~0KB runtime (build-time only) |
| **Total JS bundle (est.)** | **~93KB gzipped** |

## Complete Stack Summary

| Concern | Choice |
|---------|--------|
| Framework | React 19 + Vite 6 |
| UI Components | shadcn/ui (Radix + Tailwind) |
| API Client | Orval v8 → TanStack Query hooks |
| Forms | React Hook Form v7 + Zod |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Testing | Vitest v3 + Testing Library + Playwright |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Auth | react-oidc-context (PKCE flow) |
