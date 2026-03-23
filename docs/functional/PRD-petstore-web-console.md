# PRD — petstore-web-console

## Verification summary

| Category | Count | Notes |
|----------|-------|-------|
| Verified (against code) | 0 | No `frontend/` implementation in repo |
| Assumed (from specifications) | Primary | [spec.md](../../specs/001-petstore-web-console/spec.md), [checklists/requirements.md](../../specs/001-petstore-web-console/checklists/requirements.md) |
| Needs confirmation | See §9 | OIDC issuer, production URLs, PKCE vs `/user/login` demo flow |

---

## 1) System summary

The **Petstore Web Console** is a planned single-page web application for pet store staff (clerks, managers) to manage pets, view inventory summaries, place and cancel orders, and optionally administer users. It consumes the existing **Petstore OpenAPI 3.0.4** REST API (`https://petstore3.swagger.io/api/v3/openapi.json` per [ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md)) with **no backend code** in this repository ([spec.md](../../specs/001-petstore-web-console/spec.md) Assumptions). Visual design follows the **Stitch “The Curated Console”** system ([spec.md](../../specs/001-petstore-web-console/spec.md) Design System).

---

## 2) Users, roles and permissions

| Role | Capabilities | Permission boundaries | Evidence |
|------|--------------|----------------------|----------|
| Store staff (authenticated) | Catalogue, pet CRUD, inventory, orders (lookup/place/cancel per rules), logout | Cannot access Users section unless admin | [spec.md](../../specs/001-petstore-web-console/spec.md) User Stories 1–7, 9 |
| Administrator | Same as staff + Users CRUD | `userStatus` / admin flag drives nav visibility | [spec.md](../../specs/001-petstore-web-console/spec.md) User Story 8; [data-model.md](../../specs/001-petstore-web-console/data-model.md) User |
| Unauthenticated user | Login only | No other routes | [spec.md](../../specs/001-petstore-web-console/spec.md) User Story 9 |

---

## 3) Functional requirements

Grouped by area. IDs match [spec.md](../../specs/001-petstore-web-console/spec.md).

### Authentication and shell

- **FR-001**: Login screen; authenticate before other features — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-001
- **FR-002**: Persistent left nav (Catalogue, Inventory, Orders, Users for admins, Logout); vertical indicator pill — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-002
- **FR-020**: Session expiry → redirect to login with message — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-020

### Pet catalogue and detail

- **FR-003**: Catalogue filterable by status; default Available — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-003
- **FR-003a**: Client-side pagination with page controls and totals — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-003a
- **FR-003b**: Client-side sort control — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-003b
- **FR-004**: Pet cards: name, thumbnail, category, status badge — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-004
- **FR-005**: Pet detail: name, category, status, tags, photos — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-005
- **FR-006**: Tag-based search — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-006

### Pet write operations

- **FR-007**: Add Pet: sections Core Identity / Discovery Tags / Media; validation; chip tags; JPG/PNG max 5 MB — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-007
- **FR-008**: Edit Pet: pre-populated; same validations — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-008
- **FR-009**: Delete Pet: confirmation dialog — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-009

### Inventory

- **FR-010**: Inventory summary: counts by status — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-010
- **FR-011**: Click status group → catalogue pre-filtered — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-011

### Orders

- **FR-012**: Place order from pet detail; quantity; confirmation — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-012
- **FR-013**: Orders section: lookup by numeric ID — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-013
- **FR-014**: Cancel `placed` orders with confirmation — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-014
- **FR-015**: Hide/disable cancel for `approved` / `delivered` — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-015

### Users (admin)

- **FR-016**: Users section: search by username; create, edit, delete — admin only — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-016

### UX, errors, validation, design system

- **FR-017**: User-friendly errors (400, 404, 422, network) — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-017
- **FR-018**: Loading indicators on data fetch — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-018
- **FR-019**: Disable submit during in-flight writes — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-019
- **FR-021**: Client-side validation before submit — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-021
- **FR-022**: Stitch design system (No-Line Rule, M3 tokens, typography, glassmorphism, nav pill) — Evidence: [spec.md](../../specs/001-petstore-web-console/spec.md) FR-022

---

## 4) Key workflows

### Workflow: Login

1. User opens console without session → login screen ([spec.md](../../specs/001-petstore-web-console/spec.md) US9).
2. User submits credentials → API auth per [ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md).
3. Success → redirect to Pet Catalogue; failure → stay on login with message.

**Result:** Authenticated session with token for `api_key` header.

### Workflow: Browse and filter pets

1. User lands on catalogue with status Available ([spec.md](../../specs/001-petstore-web-console/spec.md) US1).
2. Client fetches pets (e.g. `findByStatus`); paginates and sorts in browser ([spec.md](../../specs/001-petstore-web-console/spec.md) Clarifications).
3. User changes filter / tag search / sort / page → UI updates without full reload.

**Result:** Filtered, paginated grid.

### Workflow: Add pet

1. User clicks Add Pet → form sections as FR-007.
2. Client validates → POST `/pet` ([ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md)).
3. Success → confirmation + invalidate pet queries.

**Result:** New pet visible in catalogue.

### Workflow: Place order

1. From available pet detail → Place Order → form with quantity ≥ 1 ([spec.md](../../specs/001-petstore-web-console/spec.md) US6).
2. POST `/store/order` with `status: placed` ([ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md)).
3. Show confirmation with ID, status, ship date.

**Result:** Order created.

### Workflow: Cancel order

1. Orders section → lookup by ID ([spec.md](../../specs/001-petstore-web-console/spec.md) US7).
2. If status `placed` → show Cancel → confirm → DELETE `/store/order/{orderId}`.
3. If not `placed` → cancel control hidden/disabled.

**Result:** Order removed when allowed.

---

## 5) Business rules

- **BR-1**: Only orders in `placed` status may be cancelled ([data-model.md](../../specs/001-petstore-web-console/data-model.md) Entity: Order).
- **BR-2**: Pet `name` required; `photoUrls` at least one on create per API rules ([data-model.md](../../specs/001-petstore-web-console/data-model.md) Pet).
- **BR-3**: Image uploads max **5 MB** per image ([spec.md](../../specs/001-petstore-web-console/spec.md) Clarifications).
- **BR-4**: Order `quantity` ≥ 1 ([data-model.md](../../specs/001-petstore-web-console/data-model.md) Order).
- **BR-5**: Users section visible only to administrators ([data-model.md](../../specs/001-petstore-web-console/data-model.md) User; [spec.md](../../specs/001-petstore-web-console/spec.md) US8).
- **BR-6**: v1 uses **API fields only** for pets — no pricing, breed, etc. ([spec.md](../../specs/001-petstore-web-console/spec.md) Clarifications).
- **BR-7**: Inventory v1 = status counts only — no charts/alerts/time-series ([spec.md](../../specs/001-petstore-web-console/spec.md) Clarifications).

---

## 6) User-facing constraints

| Constraint | Type | Value | Evidence |
|------------|------|-------|----------|
| Image upload | Limit | 5 MB per file | [spec.md](../../specs/001-petstore-web-console/spec.md) |
| Loading feedback | Timeout | Indicator within 200ms of request | [spec.md](../../specs/001-petstore-web-console/spec.md) SC-008 |
| Viewport | Scope | Desktop + tablet; not mobile v1 | [spec.md](../../specs/001-petstore-web-console/spec.md) Assumptions |
| API pagination | Limit | Client-side only — fetch all then paginate | [spec.md](../../specs/001-petstore-web-console/spec.md) Clarifications |

---

## 7) Integrations

| Name | Type | Direction | Purpose | Evidence |
|------|------|-----------|---------|----------|
| Petstore REST API | REST / JSON | Outbound | All CRUD and queries | [ui-api-contract.md](../../specs/001-petstore-web-console/contracts/ui-api-contract.md) |
| OpenAPI document | HTTPS | Outbound | Code generation (Orval) | [quickstart.md](../../specs/001-petstore-web-console/quickstart.md) |

---

## 8) Edge cases and error handling

| Scenario | System response | Evidence |
|----------|-----------------|----------|
| Backend unreachable | Global banner + Retry; disable writes | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |
| Pet deleted while editing | 404 → message + redirect to catalogue | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |
| Image > 5 MB | Client validation message | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |
| Non-numeric order ID | Client validation message | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |
| Order pet no longer available | Backend error → friendly message + refresh status | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |
| High latency | Loading indicators; submit disabled while in flight | [spec.md](../../specs/001-petstore-web-console/spec.md) Edge Cases |

---

## 9) Assumptions and open questions

### Assumptions

| Assumption | Reason | Missing evidence |
|------------|--------|------------------|
| OpenAPI URL is contract for all endpoints | Spec + plan | Production URL may differ |
| OAuth2 implicit in spec; PKCE in implementation plan | [spec.md](../../specs/001-petstore-web-console/spec.md) vs [research.md](../../specs/001-petstore-web-console/research.md) Decision 9 | Single agreed auth flow for v1 |

### Needs confirmation

| Item | Conflicting evidence | Resolution needed |
|------|---------------------|-------------------|
| Auth mechanism | Spec assumptions vs contract `/user/login` vs PKCE + OIDC | Product/security sign-off |
| Token storage | Contract says memory/Zustand; OIDC libs may use storage | Align with security review |

---

## Related specifications

- [spec.md](../../specs/001-petstore-web-console/spec.md)
- [checklists/requirements.md](../../specs/001-petstore-web-console/checklists/requirements.md)
- [../architecture/TSD-petstore-web-console.md](../architecture/TSD-petstore-web-console.md)

---

*Phase: functional — 2026-03-23*
