# Tasks: Petstore Web Console

**Input**: Design documents from `/specs/001-petstore-web-console/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-api-contract.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks grouped by user story (9 stories). Priority order: P1 (US9, US1, US2) → P2 (US3, US4, US5, US6) → P3 (US7, US8).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Path Conventions

- **Frontend SPA**: `frontend/src/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite + React + TypeScript project with all dependencies

- [X] T001 Scaffold Vite + React + TypeScript project in `frontend/` using `npm create vite@latest` with `react-ts` template
- [X] T002 Install core runtime dependencies: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`, `react-oidc-context`, `oidc-client-ts` in `frontend/package.json`
- [X] T003 Install Tailwind CSS v4: `tailwindcss`, `@tailwindcss/vite` and configure Vite plugin in `frontend/vite.config.ts`
- [X] T004 Initialize shadcn/ui via `npx shadcn@latest init` and configure in `frontend/`
- [X] T005 Install dev dependencies: `orval`, `msw`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test` in `frontend/package.json`
- [X] T006 [P] Configure TypeScript strict mode (`"strict": true`, no `any`) in `frontend/tsconfig.json`
- [X] T007 [P] Configure Vitest in `frontend/vite.config.ts` with React Testing Library setup
- [X] T008 [P] Create directory structure per plan.md: `frontend/src/{api,components/{ui,layout,pets,orders,inventory,users},pages,stores,lib}` and `frontend/tests/{unit,integration,e2e}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create Orval configuration in `frontend/orval.config.ts` pointing to `https://petstore3.swagger.io/api/v3/openapi.json`, outputting TanStack Query hooks + Zod schemas + MSW mocks to `frontend/src/api/`
- [X] T010 Run Orval code generation to produce `frontend/src/api/pet.ts`, `frontend/src/api/store.ts`, `frontend/src/api/user.ts`, and `frontend/src/api/model/`
- [X] T011 [P] Create API client with auth interceptor in `frontend/src/lib/api-client.ts` — attach `api_key` header from auth store, set `Content-Type: application/json` and `Accept: application/json` per contract
- [X] T012 [P] Create centralized error mapper in `frontend/src/lib/error-mapper.ts` — map HTTP 400/404/422/5xx/network errors to user-friendly messages per `ui-api-contract.md` Cross-Cutting Concerns table
- [X] T013 [P] Create Zustand auth store in `frontend/src/stores/auth-store.ts` — manage `{ username, token, expiresAt, isAdmin }` session state, sidebar toggle, and filter preferences; store token in memory only (never localStorage)
- [X] T014 [P] Configure design system tokens in `frontend/src/index.css` — Tailwind imports, Material 3 color tokens (primary `#00478d`, secondary `#1b6d24`, tertiary `#673e00`, error `#ba1a1a`, surface hierarchy), Manrope + Inter font imports, 8px border-radius default
- [X] T015 Install shadcn/ui primitives needed across stories: Button, Card, Dialog, Input, Badge, Select, Tabs, DropdownMenu, Skeleton, Toast via `npx shadcn@latest add` in `frontend/`
- [X] T016 Create AppShell layout component in `frontend/src/components/layout/AppShell.tsx` — persistent left-hand sidebar with `surface-container-low` background, vertical indicator pill (4px wide, 24px tall, primary) for active nav item, nav links for Pet Catalogue/Inventory/Orders/Users(admin)/Logout per FR-002
- [X] T017 Create global error boundary and connection-error banner component in `frontend/src/components/layout/ErrorBoundary.tsx` — display "Unable to connect" banner with Retry on network failure, disable write actions per edge cases
- [X] T018 Set up React Router v7 routes and providers in `frontend/src/App.tsx` — QueryClientProvider, AuthProvider wrapper, protected route guard redirecting unauthenticated users to login, nested layout with AppShell for authenticated routes
- [X] T019 Configure `frontend/src/main.tsx` entry point — render App with StrictMode

**Checkpoint**: Foundation ready — Orval-generated hooks available, design system tokens applied, layout shell with routing in place. User story implementation can now begin.

---

## Phase 3: User Story 9 — Login and Logout (Priority: P1) MVP

**Goal**: Authenticate users against the backend and gate all console access behind login. Session expiry redirects to login with informative message.

**Independent Test**: Open the console → see login screen → enter valid credentials → redirected to Pet Catalogue → click Logout → returned to login screen.

### Implementation for User Story 9

- [X] T020 [US9] Create LoginPage in `frontend/src/pages/LoginPage.tsx` — split layout per Stitch screen `614042d853de4e439f045378a87933f5`: branded left panel with "Kindred Petstore" branding, credential form (username + password) with error state ("Invalid username or password"), loading state on submit button to prevent double-submission per FR-019
- [X] T021 [US9] Implement login flow in LoginPage — call `GET /user/login` with username/password query params, on success store token + `X-Expires-After` in Zustand auth store, redirect to Pet Catalogue; on error show user-friendly message via error-mapper
- [X] T022 [US9] Implement logout flow in AppShell sidebar — call `GET /user/logout`, clear Zustand auth store, redirect to LoginPage
- [X] T023 [US9] Implement session expiry detection in `frontend/src/lib/api-client.ts` — monitor `X-Expires-After` header, on expiry clear auth store and redirect to login with message "Your session has expired. Please log in again." per FR-020
- [X] T024 [US9] Add protected route guard in `frontend/src/App.tsx` — redirect unauthenticated users to LoginPage, preserve intended destination for post-login redirect

**Checkpoint**: Users can log in, see the app shell, and log out. All other routes are protected. Session expiry is handled.

---

## Phase 4: User Story 1 — Browse and View Pet Catalogue (Priority: P1) MVP

**Goal**: Display a paginated, filterable, sortable grid of pet cards with detail view. This is the landing page after login.

**Independent Test**: Log in → see pet cards filtered by "Available" → switch to "Pending" filter → click a card → see full pet detail → navigate back with filter preserved.

### Implementation for User Story 1

- [X] T025 [P] [US1] Create PetCard component in `frontend/src/components/pets/PetCard.tsx`
- [X] T026 [P] [US1] Create StatusFilterTabs component in `frontend/src/components/pets/StatusFilterTabs.tsx`
- [X] T027 [P] [US1] Create SortControl component in `frontend/src/components/pets/SortControl.tsx`
- [X] T028 [P] [US1] Create Pagination component in `frontend/src/components/pets/Pagination.tsx`
- [X] T029 [US1] Create PetCataloguePage in `frontend/src/pages/PetCataloguePage.tsx`
- [X] T030 [P] [US1] Create TagSearch component in `frontend/src/components/pets/TagSearch.tsx`
- [X] T031 [P] [US1] Create PhotoGallery component in `frontend/src/components/pets/PhotoGallery.tsx`
- [X] T032 [US1] Create PetDetailPage in `frontend/src/pages/PetDetailPage.tsx`
- [X] T033 [US1] Add routes for `/pets` (catalogue), `/pets/:petId` (detail) in `frontend/src/App.tsx`

**Checkpoint**: Users can browse the full pet catalogue with filtering, sorting, pagination, tag search, and view pet details. Read-only MVP is functional.

---

## Phase 5: User Story 2 — Create a New Pet (Priority: P1)

**Goal**: Allow store clerks to add new pets with name, category, status, tags (chip input), and photo upload.

**Independent Test**: Click "Add Pet" from catalogue → fill form → submit → see new pet in catalogue under "Available".

### Implementation for User Story 2

- [X] T034 [P] [US2] Create TagChipInput component in `frontend/src/components/pets/TagChipInput.tsx`
- [X] T035 [P] [US2] Create ImageUpload component in `frontend/src/components/pets/ImageUpload.tsx`
- [X] T036 [US2] Create PetForm component in `frontend/src/components/pets/PetForm.tsx`
- [X] T037 [US2] Create AddEditPetPage in `frontend/src/pages/AddEditPetPage.tsx`
- [X] T038 [US2] Wire "Add Pet" button in PetCataloguePage toolbar

**Checkpoint**: Clerks can create new pets with full validation, tag chips, and photo upload. Catalogue updates immediately.

---

## Phase 6: User Story 3 — Edit an Existing Pet (Priority: P2)

**Goal**: Allow clerks to edit any pet field from the detail view, with the same form and validations as creation.

**Independent Test**: Open pet detail → click Edit → change status to "Pending" → Save → detail view shows "Pending".

### Implementation for User Story 3

- [X] T039 [US3] Wire Edit mode in AddEditPetPage
- [X] T040 [US3] Wire "Edit" button in PetDetailPage

**Checkpoint**: Clerks can edit pets with pre-populated form, same validations as create, and cache invalidation.

---

## Phase 7: User Story 4 — Delete a Pet (Priority: P2)

**Goal**: Allow managers to delete pets with confirmation dialog.

**Independent Test**: Open pet detail → click Delete → confirm in dialog → returned to catalogue, pet gone.

### Implementation for User Story 4

- [X] T041 [US4] Create DeleteConfirmDialog component in `frontend/src/components/pets/DeleteConfirmDialog.tsx`
- [X] T042 [US4] Wire "Delete" button in PetDetailPage

**Checkpoint**: Managers can delete pets with confirmation. Error cases (already deleted, invalid ID) handled gracefully.

---

## Phase 8: User Story 5 — View Store Inventory (Priority: P2)

**Goal**: Display inventory summary with status count cards and quick-action links to catalogue.

**Independent Test**: Navigate to Inventory → see 3 status count cards (Available, Pending, Sold) → click a card → go to catalogue pre-filtered.

### Implementation for User Story 5

- [X] T043 [P] [US5] Create StatusCard component in `frontend/src/components/inventory/StatusCard.tsx`
- [X] T044 [US5] Create InventoryPage in `frontend/src/pages/InventoryPage.tsx`
- [X] T045 [US5] Add route `/inventory` in `frontend/src/App.tsx`; update PetCataloguePage

**Checkpoint**: Managers see real-time inventory counts with one-click navigation to filtered catalogue.

---

## Phase 9: User Story 6 — Place a New Order (Priority: P2)

**Goal**: Allow clerks to place orders from the pet detail view with quantity input and confirmation.

**Independent Test**: Open available pet detail → click Place Order → set quantity → submit → see order confirmation with ID, status, ship date.

### Implementation for User Story 6

- [X] T046 [P] [US6] Create OrderForm component in `frontend/src/components/orders/OrderForm.tsx`
- [X] T047 [P] [US6] Create OrderConfirmation component in `frontend/src/components/orders/OrderConfirmation.tsx`
- [X] T048 [US6] Wire "Place Order" button in PetDetailPage

**Checkpoint**: Clerks can place orders from pet detail with validation and confirmation display.

---

## Phase 10: User Story 7 — View and Cancel Orders (Priority: P3)

**Goal**: Allow managers to look up orders by ID and cancel "placed" orders.

**Independent Test**: Navigate to Orders → enter order ID → see details → cancel a "placed" order → confirmation → order cleared.

### Implementation for User Story 7

- [X] T049 [P] [US7] Create OrderSearch component in `frontend/src/components/orders/OrderSearch.tsx`
- [X] T050 [P] [US7] Create OrderDetail component in `frontend/src/components/orders/OrderDetail.tsx`
- [X] T051 [US7] Create OrdersPage in `frontend/src/pages/OrdersPage.tsx`
- [X] T052 [US7] Add route `/orders` in `frontend/src/App.tsx`

**Checkpoint**: Managers can look up and cancel orders. Status-based cancel restrictions enforced.

---

## Phase 11: User Story 8 — User Management (Priority: P3)

**Goal**: Admin-only section for CRUD operations on user accounts.

**Independent Test**: Log in as admin → navigate to Users → create user → search by username → edit profile → delete user. Non-admin users cannot see Users nav item.

### Implementation for User Story 8

- [X] T053 [P] [US8] Create UserSearch component in `frontend/src/components/users/UserSearch.tsx`
- [X] T054 [P] [US8] Create UserForm component in `frontend/src/components/users/UserForm.tsx`
- [X] T055 [P] [US8] Create UserProfile component in `frontend/src/components/users/UserProfile.tsx`
- [X] T056 [US8] Create UsersPage in `frontend/src/pages/UsersPage.tsx`
- [X] T057 [US8] Add route `/users` in `frontend/src/App.tsx`; conditionally render Users nav item
- [X] T058 [US8] Add admin route guard for `/users` in `frontend/src/App.tsx`

**Checkpoint**: Admins can manage user accounts. Non-admins cannot access or see the Users section.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T059 [P] Add loading Skeleton components across all pages — verify every data-fetching screen shows indicator within 200ms per FR-018 and SC-008
- [X] T060 [P] Add Toast notification system in `frontend/src/components/ui/` — success/error toasts for all mutations (create/edit/delete pet, place/cancel order, create/edit/delete user)
- [X] T061 Verify double-submission prevention across all write operations — confirm submit buttons are disabled during in-flight requests per FR-019
- [X] T062 [P] Verify responsive layout on desktop (1280px+) and tablet (768px–1279px) — no horizontal scrolling or overlapping content per SC-007
- [X] T063 [P] Audit design system compliance — verify No-Line Rule (no 1px borders), surface-level nesting, glassmorphism on modals, CTA gradients on primary actions, 8px border-radius, Manrope headings + Inter body per FR-022
- [X] T064 [P] Audit accessibility — verify all interactive elements are keyboard-navigable, ARIA attributes from Radix UI are intact, color contrast meets WCAG 2.1 AA per Constitution VII
- [X] T065 Run `npx tsc --noEmit` and `npm run lint` — fix any TypeScript strict mode or linter errors per Constitution Quality Gates
- [X] T066 Run quickstart.md validation — verify setup commands, dev server startup, and Orval generation work per documented instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US9 Login (Phase 3)**: Depends on Foundational — BLOCKS US1-US8 (auth required)
- **US1 Catalogue (Phase 4)**: Depends on US9 — provides the landing page and detail view needed by US2-US6
- **US2 Create Pet (Phase 5)**: Depends on US1 (catalogue page for "Add Pet" button + PetForm reuse)
- **US3 Edit Pet (Phase 6)**: Depends on US1 (detail view) + US2 (PetForm component reuse)
- **US4 Delete Pet (Phase 7)**: Depends on US1 (detail view) — can parallel with US3
- **US5 Inventory (Phase 8)**: Depends on Foundational only — can parallel with US1+ (independent page)
- **US6 Place Order (Phase 9)**: Depends on US1 (detail view)
- **US7 Orders (Phase 10)**: Depends on Foundational only — can parallel with US1+ (independent page)
- **US8 Users (Phase 11)**: Depends on Foundational only — can parallel with US1+ (independent page)
- **Polish (Phase 12)**: Depends on all desired user stories complete

### User Story Dependencies

- **US9 (P1)**: Foundational → US9 (no other story dependencies)
- **US1 (P1)**: US9 → US1 (needs auth)
- **US2 (P1)**: US1 → US2 (needs catalogue page)
- **US3 (P2)**: US2 → US3 (reuses PetForm)
- **US4 (P2)**: US1 → US4 (needs detail view) — **parallel with US3**
- **US5 (P2)**: US9 → US5 (independent page) — **parallel with US1+**
- **US6 (P2)**: US1 → US6 (needs detail view) — **parallel with US3, US4**
- **US7 (P3)**: US9 → US7 (independent page) — **parallel with US1+**
- **US8 (P3)**: US9 → US8 (independent page) — **parallel with US1+**

### Parallel Opportunities

Within Phase 2 (Foundational):
- T011, T012, T013, T014 can all run in parallel (different files)

Within Phase 4 (US1):
- T025, T026, T027, T028, T030, T031 can all run in parallel (separate components)

Within Phase 5 (US2):
- T034, T035 can run in parallel (separate components)

After US9 completes:
- US5 (Inventory), US7 (Orders), US8 (Users) can start in parallel with US1 since they are independent pages

After US1 completes:
- US4 (Delete) and US6 (Place Order) can run in parallel (both need detail view, different features)

---

## Parallel Example: User Story 1

```bash
# Launch all independent components in parallel:
Task: "Create PetCard component in frontend/src/components/pets/PetCard.tsx"
Task: "Create StatusFilterTabs in frontend/src/components/pets/StatusFilterTabs.tsx"
Task: "Create SortControl in frontend/src/components/pets/SortControl.tsx"
Task: "Create Pagination in frontend/src/components/pets/Pagination.tsx"
Task: "Create TagSearch in frontend/src/components/pets/TagSearch.tsx"
Task: "Create PhotoGallery in frontend/src/components/pets/PhotoGallery.tsx"

# Then compose them sequentially:
Task: "Create PetCataloguePage in frontend/src/pages/PetCataloguePage.tsx"
Task: "Create PetDetailPage in frontend/src/pages/PetDetailPage.tsx"
Task: "Add routes in frontend/src/App.tsx"
```

---

## Implementation Strategy

### MVP First (US9 + US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US9 Login/Logout
4. Complete Phase 4: US1 Browse/View Catalogue
5. **STOP and VALIDATE**: Log in, browse pets, view details, log out
6. Deploy/demo if ready — read-only console is immediately useful

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US9 (Login) → Auth working → Protected routes functional
3. US1 (Catalogue) → Test independently → **Deploy/Demo (MVP!)**
4. US2 (Create Pet) → Clerks can add pets → Deploy/Demo
5. US3 + US4 (Edit + Delete) → Full pet CRUD → Deploy/Demo
6. US5 (Inventory) + US6 (Place Order) → Management + ordering → Deploy/Demo
7. US7 (Orders) + US8 (Users) → Complete feature set → Deploy/Demo
8. Polish → Production-ready

### Parallel Team Strategy

With multiple developers after Foundational + US9 complete:

- **Developer A**: US1 (Catalogue) → US2 (Create) → US3 (Edit)
- **Developer B**: US5 (Inventory) → US7 (Orders) → US4 (Delete)
- **Developer C**: US8 (Users) → US6 (Place Order) → Polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All API calls use Orval-generated hooks — no hand-written fetch code (Constitution I)
- All errors routed through error-mapper (Constitution V)
- All forms use React Hook Form + Zod from Orval schemas (Constitution IV)
