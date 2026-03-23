# Feature Specification: Petstore Web Console

**Feature Branch**: `001-petstore-web-console`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: User description: "Build a Petstore Web Console UI client that allows non-technical users to browse pets by status, view details, create/edit/delete pets, view inventory and create/cancel orders, and optionally manage users. The existing Petstore OpenAPI spec at https://petstore3.swagger.io/api/v3/openapi.json serves as the backend contract."

## Clarifications

### Session 2026-03-22

- Q: The wireframes show extended pet attributes (pricing, breed, gender, weight, SKU, arrival date, physical location) not present in the OpenAPI spec. Should the console include these? → A: Use existing API fields only (name, category, status, tags, photos). Omit pricing, breed, gender, weight, SKU, and location from v1. The wireframe visuals for those fields are aspirational; v1 maps strictly to the current API contract.
- Q: The Inventory Dashboard wireframe shows category distribution charts, alert notifications, and a time-series "Inventory Flow" chart. The API only returns status→count. What scope for v1? → A: Status counts only. Show the 3 status count cards (Available, Pending, Sold) with quick-action links to the catalogue. No charts, alerts, or time-series in v1.
- Q: The wireframe shows Pet Catalogue pagination ("Showing 1 to 4 of 48 results") and sort controls ("Sort by: Newest"). The API has no server-side pagination. Should the console paginate? → A: Client-side pagination + sort. Fetch all results from the API, then paginate and sort in the browser matching the wireframe's page controls and sort dropdown.
- Q: The Stitch wireframes include a comprehensive design system ("The Curated Console") with specific rules for colors, typography, borders, navigation, and glassmorphism. Should the spec formally adopt it? → A: Adopt fully. The Stitch design system is the authoritative visual specification. Developers must follow its tokens, typography, layout rules, and component patterns.
- Q: The Add/Edit Pet wireframe shows a 10 MB image upload limit (spec says 5 MB) and a chip-based tag input. Which limit and UX pattern should apply? → A: Keep the spec's 5 MB image limit (overrides wireframe's 10 MB). Adopt the chip-based tag input pattern from the wireframe (type, press Enter/click "Add," removable chips).

## Assumptions

- The Petstore backend is already deployed and accessible; this spec covers only the front-end console.
- The OpenAPI spec (v1.0.27, OpenAPI 3.0.4) defines the complete set of backend capabilities; the console will not require additional endpoints.
- "Non-technical users" means pet store staff (clerks, managers) who are comfortable with web browsers but have no developer or API knowledge.
- Authentication follows the OAuth2 implicit flow already defined in the OpenAPI spec; the console handles login/logout transparently.
- Pet images are referenced by URL; the console supports uploading new images via the existing upload endpoint.
- Order cancellation maps to the "delete order" endpoint in the API contract.
- The console is a single web application accessed through a standard desktop or tablet browser; mobile-phone optimization is not in scope for v1.
- User management is a lower-priority, optional module intended for store administrators only.
- Extended pet attributes shown in wireframes (pricing, breed, gender, weight, SKU, location) are out of scope for v1; the console displays only fields available from the current API.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and View Pet Catalogue (Priority: P1)

A store clerk opens the Petstore Web Console and lands on the **Pet Catalogue** screen. They see a paginated grid of pets filtered by status (Available, Pending, Sold) with "Available" selected by default. Each pet card shows the pet's name, photo thumbnail, category, and status badge. A sort control ("Sort by: Newest") lets the clerk reorder the grid. Page controls at the bottom show the current page and total results (e.g., "Showing 1 to 12 of 48 results"). The clerk clicks a pet card to open a **Pet Detail** view showing the full information: name, category, status, tags, and photo gallery. From the detail view they can navigate back to the catalogue or proceed to edit.

**Why this priority**: Browsing is the most fundamental action—every user session starts here. Without a readable catalogue the console has no value.

**Independent Test**: Can be fully tested by loading the console, switching between status filters, and opening a pet detail page. Delivers immediate read-only value to any store employee.

**Acceptance Scenarios**:

1. **Given** the console is loaded and the user is logged in, **When** the Pet Catalogue screen renders, **Then** the list displays all pets with status "available" by default, showing name, thumbnail, category, and status badge for each pet.
2. **Given** the Pet Catalogue is displayed, **When** the user selects the "Pending" status filter, **Then** only pets with status "pending" are shown and the filter selection is visually highlighted.
3. **Given** the Pet Catalogue is displayed, **When** the user selects the "Sold" status filter, **Then** only pets with status "sold" are shown.
4. **Given** a list of pets is displayed, **When** the user clicks a pet card, **Then** a Pet Detail view opens showing the pet's name, category, all tags, status, and photo gallery.
5. **Given** the Pet Detail view is open, **When** the user clicks the back/close control, **Then** they return to the catalogue with their previous filter selection preserved.
6. **Given** the user types a search term into the tag search field, **When** results return, **Then** only pets matching the specified tags are shown.
7. **Given** the backend returns an empty list for a selected status, **When** the catalogue renders, **Then** a friendly "No pets found" message is shown with a suggestion to change filters.
8. **Given** the catalogue has more pets than fit on one page, **When** the catalogue renders, **Then** page controls are displayed showing current page, total results count, and navigation to other pages.
9. **Given** the catalogue is displaying results, **When** the user selects a sort option (e.g., "Sort by: Newest"), **Then** the pet cards are reordered accordingly within the current filter.

---

### User Story 2 - Create a New Pet (Priority: P1)

A store clerk receives a new animal at the store. They click "Add Pet" from the catalogue toolbar, fill in the pet's name (required), select a category from a dropdown, set the status to "Available," optionally add tags using a chip-based input (type a tag, press Enter or click "Add" to create a removable chip), and upload one or more photos (JPG/PNG, max 5 MB each). The form is organized into sections: Core Identity, Discovery Tags, and Media Gallery. On submission the pet appears in the catalogue immediately.

**Why this priority**: Adding pets is the primary write operation that keeps the catalogue current. Without it the console is read-only and staff must fall back to manual methods.

**Independent Test**: Can be tested by clicking "Add Pet," completing the form with valid data, submitting, and verifying the new pet appears in the catalogue under "Available."

**Acceptance Scenarios**:

1. **Given** the user is on the Pet Catalogue screen, **When** they click "Add Pet," **Then** a pet creation form opens with sectioned layout: Core Identity (name, category, status), Discovery Tags (chip-based input), and Media Gallery (photo upload with preview).
2. **Given** the creation form is open, **When** the user submits without entering a name, **Then** a validation message appears ("Pet name is required") and the form is not submitted.
3. **Given** the creation form is filled with valid data, **When** the user clicks "Save," **Then** the pet is created successfully, a confirmation message is shown, and the catalogue refreshes to include the new pet.
4. **Given** the creation form is open, **When** the user uploads a photo, **Then** a thumbnail preview of the photo is displayed before submission.
5. **Given** the creation form is open, **When** the user clicks "Cancel," **Then** the form closes without saving and the user returns to the catalogue.
6. **Given** the Discovery Tags section, **When** the user types a tag and presses Enter or clicks "Add," **Then** the tag appears as a removable chip. Clicking the "×" on a chip removes that tag.

---

### User Story 3 - Edit an Existing Pet (Priority: P2)

A clerk needs to update a pet's information—for example, changing the status from "Available" to "Pending" after a customer shows interest. From the Pet Detail view the clerk clicks "Edit," modifies any field, and saves. The detail view refreshes with the updated data.

**Why this priority**: Editing keeps data accurate. It builds on the detail view (P1) and is the natural next action after browsing.

**Independent Test**: Can be tested by opening any existing pet's detail view, clicking "Edit," changing the status, saving, and confirming the updated status is displayed.

**Acceptance Scenarios**:

1. **Given** the Pet Detail view is open, **When** the user clicks "Edit," **Then** the view switches to an editable form pre-populated with the pet's current data.
2. **Given** the edit form is open, **When** the user changes the status from "Available" to "Pending" and clicks "Save," **Then** the pet's status is updated, a success message is shown, and the detail view shows "Pending."
3. **Given** the edit form is open, **When** the user clears the name field and clicks "Save," **Then** a validation error appears ("Pet name is required") and the change is not saved.
4. **Given** the edit form is open, **When** the user clicks "Cancel," **Then** all unsaved changes are discarded and the detail view shows the original data.

---

### User Story 4 - Delete a Pet (Priority: P2)

A manager needs to remove a pet record that was entered in error. From the Pet Detail view they click "Delete," confirm the action in a dialog, and the pet is removed from the catalogue.

**Why this priority**: Deletion is essential for data hygiene but less frequent than browsing or editing, so it sits at P2.

**Independent Test**: Can be tested by opening a pet's detail, clicking "Delete," confirming, and verifying the pet no longer appears in the catalogue.

**Acceptance Scenarios**:

1. **Given** the Pet Detail view is open, **When** the user clicks "Delete," **Then** a confirmation dialog appears asking "Are you sure you want to delete this pet?"
2. **Given** the confirmation dialog is shown, **When** the user confirms deletion, **Then** the pet is deleted, a success message is shown, and the user is returned to the catalogue without the deleted pet.
3. **Given** the confirmation dialog is shown, **When** the user cancels, **Then** the dialog closes and the pet remains unchanged.
4. **Given** the backend returns an error on deletion (e.g., invalid ID), **When** the user confirms deletion, **Then** a user-friendly error message is displayed and the pet is not removed from the view.

---

### User Story 5 - View Store Inventory (Priority: P2)

A store manager navigates to the **Inventory** section from the main navigation. They see a summary dashboard showing pet counts grouped by status (e.g., Available: 42, Pending: 7, Sold: 15) displayed as prominent count cards with quick-action links ("View Catalogue," "Review Orders"). This gives them a quick operational snapshot without scrolling through the full catalogue. Charts, alerts, and historical trends are out of scope for v1.

**Why this priority**: Inventory visibility is a key management need. It is read-only and independent of pet CRUD.

**Independent Test**: Can be tested by navigating to the Inventory section and verifying the status-count summary matches the current data.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Inventory section, **When** the page loads, **Then** a summary displays pet counts grouped by status.
2. **Given** the inventory summary is displayed, **When** the user clicks on a status group (e.g., "Available: 42"), **Then** they are navigated to the Pet Catalogue pre-filtered to that status.
3. **Given** the backend is temporarily unavailable, **When** the inventory page loads, **Then** a friendly error message is shown with a "Retry" button.

---

### User Story 6 - Place a New Order (Priority: P2)

A clerk wants to process a customer purchase. From the Pet Detail view of an available pet, they click "Place Order." A form appears where they set the quantity and confirm. On success the order details (order ID, status, ship date) are displayed.

**Why this priority**: Ordering is the primary revenue-generating action and the natural progression after browsing.

**Independent Test**: Can be tested by opening an available pet, placing an order, and verifying the order confirmation screen appears with correct data.

**Acceptance Scenarios**:

1. **Given** the Pet Detail view of an available pet, **When** the user clicks "Place Order," **Then** an order form opens pre-filled with the pet's ID and a default quantity of 1.
2. **Given** the order form is filled with valid data, **When** the user clicks "Submit Order," **Then** the order is placed successfully and a confirmation screen shows the order ID, status ("placed"), and estimated ship date.
3. **Given** the order form is open, **When** the user enters a quantity of 0 or a negative number, **Then** a validation error appears ("Quantity must be at least 1").
4. **Given** the order form is open, **When** the user clicks "Cancel," **Then** the form closes and no order is created.

---

### User Story 7 - View and Cancel Orders (Priority: P3)

A manager navigates to the **Orders** section to view existing orders. They can look up an order by its ID and see its details (pet, quantity, status, ship date). If an order is still in "placed" status, they can cancel it.

**Why this priority**: Order management is needed but used less frequently than placing orders. Cancel is a corrective action, not a daily workflow.

**Independent Test**: Can be tested by navigating to Orders, looking up an order by ID, viewing its details, and cancelling a "placed" order.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Orders section, **When** the page loads, **Then** they see a search field to look up an order by ID.
2. **Given** the user enters a valid order ID, **When** they click "Search," **Then** the order details are displayed (order ID, pet ID, quantity, status, ship date, completion flag).
3. **Given** an order with status "placed" is displayed, **When** the user clicks "Cancel Order," **Then** a confirmation dialog appears.
4. **Given** the cancellation confirmation is shown, **When** the user confirms, **Then** the order is cancelled (deleted), a success message is shown, and the order view is cleared.
5. **Given** an order with status "approved" or "delivered" is displayed, **When** the user views the order, **Then** the "Cancel Order" button is disabled or hidden.
6. **Given** the user enters an invalid or non-existent order ID, **When** they click "Search," **Then** a message appears: "Order not found. Please check the ID and try again."

---

### User Story 8 - User Management (Priority: P3)

An administrator navigates to the **Users** section to manage store staff accounts. They can view a user's profile by username, create new user accounts, edit existing user profiles, and delete user accounts. This section is accessible only to users with administrative privileges.

**Why this priority**: User management is an optional, administrative function that does not affect day-to-day pet or order operations. It is the lowest priority module.

**Independent Test**: Can be tested by navigating to Users, creating a new user, viewing their profile, editing a field, and deleting the account.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Users section, **When** the page loads, **Then** they see a search field to look up a user by username and a "Create User" button.
2. **Given** the user clicks "Create User," **When** a form appears, **Then** it includes fields for username, first name, last name, email, phone, and password.
3. **Given** the create-user form is filled with valid data, **When** the user clicks "Save," **Then** the user account is created and a confirmation message is shown.
4. **Given** a user profile is displayed, **When** the administrator clicks "Edit," **Then** the profile switches to an editable form pre-populated with the user's current data.
5. **Given** a user profile is displayed, **When** the administrator clicks "Delete," **Then** a confirmation dialog appears, and upon confirming, the user account is removed.
6. **Given** a non-administrative user accesses the console, **When** they look at the navigation, **Then** the "Users" section is not visible or accessible.

---

### User Story 9 - Login and Logout (Priority: P1)

A store employee opens the Petstore Web Console and is presented with a login screen. They enter their credentials, authenticate, and are directed to the Pet Catalogue. When they are done, they click "Logout" from the navigation bar to end their session securely.

**Why this priority**: Authentication gates all other functionality. Without login, no user story is accessible.

**Independent Test**: Can be tested by opening the console, logging in with valid credentials, verifying access to the catalogue, and logging out to confirm the session ends.

**Acceptance Scenarios**:

1. **Given** the user opens the console without an active session, **When** the application loads, **Then** the login screen is displayed.
2. **Given** the login screen is displayed, **When** the user enters valid credentials and clicks "Login," **Then** they are authenticated and redirected to the Pet Catalogue.
3. **Given** the login screen is displayed, **When** the user enters invalid credentials and clicks "Login," **Then** an error message appears ("Invalid username or password") and they remain on the login screen.
4. **Given** the user is logged in, **When** they click "Logout" in the navigation bar, **Then** their session ends and they are returned to the login screen.
5. **Given** the user's session has expired, **When** they attempt any action, **Then** they are redirected to the login screen with a message ("Your session has expired. Please log in again.").

---

### Edge Cases

- What happens when the backend is unreachable? The console displays a global connection-error banner with a "Retry" option and disables all write actions.
- What happens when a pet being edited is simultaneously deleted by another user? The save attempt returns a 404; the console shows "This pet no longer exists" and redirects to the catalogue.
- What happens when a user uploads an image that exceeds a reasonable size limit? The console validates file size on the client side (before upload) and displays "Image must be under 5 MB."
- What happens when the user searches for an order with a non-numeric ID? The console validates input client-side and shows "Please enter a valid numeric order ID."
- What happens when the user attempts to place an order for a pet that is no longer available? The backend returns an error; the console shows "This pet is no longer available for ordering" and refreshes the pet's status.
- What happens when network latency is high? All data-fetching screens show a loading indicator; write operations show a progress state on the submit button to prevent double-submission.

## Design System: "The Curated Console"

**Source**: Stitch project "Petstore" (project ID: 823448846038334076)  
**Branding**: "Kindred Petstore — Management Console"

The Stitch design system is the **authoritative visual specification** for all screens. Developers must follow its tokens, typography, layout rules, and component patterns. Key rules:

### Typography
- **Headlines**: Manrope (display, headings)
- **Body & Data**: Inter (titles, body, form labels)
- **Status Labels**: label-md in ALL CAPS with `0.05rem` letter-spacing for badge/pill feel

### Color Tokens (Material 3 Tonal Palette)
- **Primary**: `#00478d` (actions, links, active nav indicator)
- **Primary Container**: `#005eb8` (CTA gradient endpoint)
- **Secondary / "Available"**: `#1b6d24` (green status badge)
- **Tertiary / "Pending"**: `#673e00` (amber status badge)
- **Error / "Sold"**: `#ba1a1a` (red status badge)
- **Surface hierarchy**: `surface` (#f9f9ff) → `surface-container-low` (#f2f3fb) → `surface-container-lowest` (#ffffff) → `surface-container-high` (#e7e8f0)

### Layout Rules
- **"No-Line Rule"**: No 1px solid borders for sectioning. Boundaries defined solely through background color shifts between surface levels.
- **Navigation**: Persistent left-hand sidebar using `surface-container-low`. Active state uses a vertical indicator pill (4px wide, 24px tall, primary color) — not a box highlight.
- **Cards**: `surface-container-lowest` background; no divider lines; status indicator as full-rounded pill in top-right corner.
- **Data Tables**: No vertical/horizontal grid lines; zebra striping via `surface-container-low` on alternating rows or rely on vertical padding.
- **Inputs**: `surface-container-highest` background with ghost border (`outline-variant` at 20% opacity). Focus state transitions border to `primary` with 2px outer glow.
- **Corners**: 8px (0.5rem) border-radius consistently.

### Depth & Effects
- **Static elements**: No shadows. Use surface-level nesting for "Natural Lift" effect.
- **Floating elements** (dropdowns, dragged cards): Ambient shadow `y: 8px, blur: 24px, rgba(25,28,33, 0.06)`.
- **Glassmorphism** (modals, "quick view" panels): `surface-container-lowest` at 80% opacity with `20px` backdrop-blur.
- **CTA Gradients**: Primary actions use linear gradient from `primary` to `primary-container` at 135°.

### Wireframe Screens (Stitch)

| Screen | Stitch Screen ID | Key UX Elements |
|--------|-----------------|-----------------|
| Login | `614042d853de4e439f045378a87933f5` | Split layout, branded left panel, credential form with error state, "Forgot Password" link |
| Pet Catalogue | `deae98875b2245f2970ce1cb25d78a37` | Card grid, status filter tabs, sort control, pagination, empty state with "Clear all filters" |
| Pet Detail View | `fae1d2d0d26a49a99db8016923384309` | Photo gallery with navigation, tag pills, "Place Order" / "Edit" / "Delete" actions, similar listings |
| Add/Edit Pet Form | `f34610038772403d8a34385d445edd30` | Sectioned form (Core Identity, Discovery Tags, Media Gallery), chip-based tag input, image upload with preview (wireframe shows 10 MB; spec overrides to 5 MB) |
| Inventory Dashboard | `1e2d7b569a8b49d7a64a8a3a3e1e747a` | 3 status count cards with quick-action links |
| Orders Management | `48052e99e49f49e39341c6e6859b3fe2` | Order detail card, activity log, related orders list, "Cancel Order" action |
| User Management | `ae9d752ebe374d64b29c40dd103f411f` | Summary stats, role-filter tabs, user directory table with pagination, security audit notice |

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login screen that authenticates users against the backend before granting access to any other feature.
- **FR-002**: System MUST display a persistent left-hand navigation sidebar (per design system) with links to Pet Catalogue, Inventory, Orders, and (for administrators) Users sections, plus a Logout control. Active section indicated by a vertical indicator pill.
- **FR-003**: System MUST display a Pet Catalogue that lists pets filterable by status (Available, Pending, Sold) with "Available" as the default filter.
- **FR-003a**: System MUST paginate the Pet Catalogue client-side with page controls showing current page, total result count, and page navigation.
- **FR-003b**: System MUST provide a sort control on the Pet Catalogue (e.g., "Sort by: Newest") that reorders cards client-side.
- **FR-004**: System MUST display each pet in the catalogue as a card showing name, photo thumbnail, category, and status badge.
- **FR-005**: System MUST provide a Pet Detail view accessible from the catalogue that shows name, category, status, tags, and all photos.
- **FR-006**: System MUST provide a tag-based search capability to find pets by one or more tags.
- **FR-007**: System MUST provide an "Add Pet" form organized into sections (Core Identity, Discovery Tags, Media Gallery) with required field validation (name is required), chip-based tag input (type + Enter/Add to create, × to remove), and optional photo upload with preview (JPG/PNG, max 5 MB per image).
- **FR-008**: System MUST provide an "Edit Pet" form pre-populated with the pet's current data and enforce the same validations as creation.
- **FR-009**: System MUST provide a "Delete Pet" action with a confirmation dialog before executing deletion.
- **FR-010**: System MUST display an Inventory summary showing pet counts grouped by status.
- **FR-011**: System MUST allow users to click a status group in the inventory to navigate to the Pet Catalogue pre-filtered to that status.
- **FR-012**: System MUST provide an order placement flow from the Pet Detail view, with a form for quantity and a confirmation screen upon success.
- **FR-013**: System MUST provide an Orders section where users can look up an order by its numeric ID and view its details.
- **FR-014**: System MUST allow cancellation of orders that are in "placed" status, with a confirmation dialog.
- **FR-015**: System MUST disable or hide the "Cancel Order" option for orders in "approved" or "delivered" status.
- **FR-016**: System MUST provide a Users management section (visible only to administrators) with the ability to search by username, create, edit, and delete user accounts.
- **FR-017**: System MUST display user-friendly error messages for all backend errors (400, 404, 422, network failures) without exposing technical details.
- **FR-018**: System MUST show loading indicators during all data-fetching operations.
- **FR-019**: System MUST prevent double-submission of write operations (create, edit, delete, place order) by disabling the submit control while a request is in progress.
- **FR-020**: System MUST redirect users to the login screen when their session expires, with an informative message.
- **FR-021**: System MUST validate form inputs on the client side before submitting to the backend (e.g., required fields, numeric-only order IDs, image file size limits).
- **FR-022**: System MUST implement the "The Curated Console" design system from Stitch, including the No-Line Rule, Material 3 color tokens, Manrope/Inter typography pairing, glassmorphism for modals, and vertical indicator-pill navigation.

### Key Entities

- **Pet**: The central entity. Has a name (required), category, status (available / pending / sold), a set of tags, and one or more photo URLs. Uniquely identified by ID.
- **Category**: A classification for pets (e.g., Dogs, Cats). Has an ID and a name. Each pet belongs to one category.
- **Tag**: A label that can be attached to a pet for search purposes. Has an ID and a name. A pet can have zero or many tags.
- **Order**: Represents a customer purchase. References a pet by ID, includes quantity, ship date, status (placed / approved / delivered), and a completion flag. Uniquely identified by order ID.
- **User**: A store staff account. Has a username (unique identifier), first name, last name, email, phone, password, and a user-status flag. Administrators have elevated privileges to access the Users section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can browse available pets and view a pet's details within 60 seconds of logging in, without any training or documentation.
- **SC-002**: A store clerk can add a new pet (including photo upload) in under 2 minutes.
- **SC-003**: A store clerk can change a pet's status (e.g., Available to Pending) in under 30 seconds from the catalogue.
- **SC-004**: A store clerk can place an order for a pet in under 1 minute from the pet's detail view.
- **SC-005**: 90% of users successfully complete any primary task (browse, add, edit, order) on their first attempt without errors.
- **SC-006**: All user-facing error messages are non-technical and suggest a corrective action (no raw status codes or stack traces).
- **SC-007**: The console is usable on desktop and tablet screen sizes without horizontal scrolling or overlapping content.
- **SC-008**: Every screen displays a loading indicator within 200 milliseconds of initiating a data request, keeping users informed of progress.
