# petstore-web-console — Technology Stack Baseline

> **Provenance:** Spec/plan only. No `package.json` or lockfile in this repository yet. Versions are **planned** per [plan.md](../../specs/001-petstore-web-console/plan.md), [research.md](../../specs/001-petstore-web-console/research.md), [quickstart.md](../../specs/001-petstore-web-console/quickstart.md), [.cursor/rules/specify-rules.mdc](../../.cursor/rules/specify-rules.mdc).

## 1) Build and packaging

### 1.1 Build system

| Field | Value | Evidence |
|-------|--------|----------|
| Tool | Vite 6 + npm (or pnpm) | [plan.md](../../specs/001-petstore-web-console/plan.md) Technical Context; [quickstart.md](../../specs/001-petstore-web-console/quickstart.md) Prerequisites |

### 1.2 Language and runtime

| Field | Value | Evidence |
|-------|--------|----------|
| Language + version | TypeScript 5.x (strict) | [plan.md](../../specs/001-petstore-web-console/plan.md); [constitution.md](../../.specify/memory/constitution.md) Technology Boundaries |
| Runtime target | Modern browsers (Chrome, Firefox, Safari, Edge) | [plan.md](../../specs/001-petstore-web-console/plan.md) Target Platform |
| Node (tooling) | Node.js 20+ | [quickstart.md](../../specs/001-petstore-web-console/quickstart.md) Prerequisites |

### 1.3 Module layout

| Module | Purpose | Key packages/files | Evidence |
|--------|---------|-------------------|----------|
| `frontend/` (planned) | SPA application | `src/api/`, `components/`, `pages/`, `stores/`, `lib/` | [plan.md](../../specs/001-petstore-web-console/plan.md) § Source Code |
| `specs/001-petstore-web-console/` | SDD artifacts | spec, plan, data-model, contracts | Repository layout |

### 1.4 Deployable artifacts

| Artifact | Packaging | Producing module | Output path | Evidence |
|----------|-----------|------------------|-------------|----------|
| SPA static assets | Vite build output | `frontend/` (planned) | `frontend/dist` (typical Vite) | [quickstart.md](../../specs/001-petstore-web-console/quickstart.md) (Vite scaffold) |

---

## 2) Core frameworks and libraries

| Area | Technology | Version | Evidence |
|------|------------|---------|----------|
| UI framework | React | 19 | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 1 |
| Build / dev server | Vite | 6 | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 1 |
| Routing | React Router | v7 | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 8 |
| Server state / async | TanStack Query | v5 | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 5 |
| Client state | Zustand | v5 | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 5 |
| Forms | React Hook Form | v7 + Zod resolver | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 4 |
| Validation | Zod | (with Orval-generated schemas) | [plan.md](../../specs/001-petstore-web-console/plan.md); [constitution.md](../../.specify/memory/constitution.md) IV |
| UI components | shadcn/ui (Radix + Tailwind CSS v4) | — | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decisions 2, 7 |
| API client generation | Orval | v8 → TanStack Query hooks | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 3 |
| Auth (client) | react-oidc-context (oidc-client-ts) | PKCE | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 9 |
| Unit / integration tests | Vitest v3 + React Testing Library | — | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 6 |
| E2E | Playwright | — | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 6 |
| API mocking | MSW | Orval-generated handlers | [plan.md](../../specs/001-petstore-web-console/plan.md); [research.md](../../specs/001-petstore-web-console/research.md) Decision 6 |

---

## 3) Data and storage

### 3.1 Databases

- **Runtime DBs:** None in the SPA. All persistence via Petstore REST API.
- **Evidence:** [data-model.md](../../specs/001-petstore-web-console/data-model.md) introduction; [plan.md](../../specs/001-petstore-web-console/plan.md) Storage: N/A.

### 3.2 Connection strategy

- **Connection method:** HTTPS `fetch` from generated Orval client; `api_key` header for authenticated calls per [ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md).
- **Pooling:** N/A (browser HTTP client).

### 3.3 Migration tool

- **Tool:** None (no local schema).
- **Evidence:** [docs/discovery/DISCOVERY.md](../discovery/DISCOVERY.md).

---

## 4) Runtime environment

### 4.1 App server / container

- **Type:** Static SPA served by dev server (Vite) in development; production hosting **not specified** in repo.
- **Evidence:** [plan.md](../../specs/001-petstore-web-console/plan.md) Project Type: web-app SPA.

### 4.2 Configuration strategy

- **Sources:** Environment variables / build-time config for API base URL (typical); OpenAPI URL in [quickstart.md](../../specs/001-petstore-web-console/quickstart.md) (`https://petstore3.swagger.io/api/v3/openapi.json`).
- **Secrets:** No secrets documented in specs; tokens in memory per contract ([ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md) Session Management).

### 4.3 External dependencies

| Dependency | Type | Config key(s) | Evidence |
|------------|------|---------------|----------|
| Petstore REST API | HTTPS REST | OpenAPI URL / base URL | [ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md) header |
| OAuth / OIDC | Auth | Per react-oidc-context setup (not fully specified in repo) | [research.md](../../specs/001-petstore-web-console/research.md) Decision 9; [spec.md](../../specs/001-petstore-web-console/spec.md) Assumptions (OAuth2) |

---

## 5) Observability

- **Logging:** Not specified in feature docs (browser console only assumed for dev).
- **Metrics/tracing:** Not in scope for documented v1 SPA.
- **Evidence:** Gap — no `frontend/` implementation.

---

## 6) Gaps / open questions

| Item | Missing evidence |
|------|------------------|
| Exact dependency versions | No `package.json` / lockfile in workspace |
| Production hosting | No Dockerfile, CI, or deploy config in repo |
| OIDC issuer / client metadata | Auth flow described at high level; no env template in repo |
| Orval output layout | Planned paths in [plan.md](../../specs/001-petstore-web-console/plan.md); not generated yet |

---

## Related specifications

- [DISCOVERY.md](../discovery/DISCOVERY.md) — scope and evidence model
- [DEPLOYMENT.md](../deployment/DEPLOYMENT.md) — runtime topology
- [PATTERNS.md](../patterns/PATTERNS.md) — intended architecture patterns

---

*Phase: stack — 2026-03-23*
