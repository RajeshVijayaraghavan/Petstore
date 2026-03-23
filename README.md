# Workshop pre-read: Spec-Driven Development with Spec Kit (Cursor)

Complete this checklist **before** the session so you can follow along with slash commands, specs, and (optionally) Stitch design context.

---

## 1. Repository and “basic prompt”

**Instructor:** Push this repository to GitHub (or your org remote) and share the **clone URL** and **default branch** name.

**What to clone:** The full repository so you have:

- `.cursor/commands/` — `/speckit.*` slash commands
- `.specify/` — scripts, templates, and project constitution

**Basic prompt** (copy-paste for `/speckit.specify` or discussion). This is the same **Input** described as follows 

```text
Build a "Petstore Web Console" — a browser-based management UI for pet-store staff
(clerks and managers) who have no developer or API knowledge.

## Backend contract
The existing Petstore REST API is the sole backend. The OpenAPI spec is at:
https://petstore3.swagger.io/api/v3/openapi.json
The console MUST NOT invent endpoints or add a backend-for-frontend layer.
All client types and query hooks should be auto-generated from this spec.

## Wireframes / design system
Stitch wireframes are the authoritative visual reference:
https://stitch.withgoogle.com/projects/823448846038334076
The design system ("The Curated Console") uses Material 3 tonal palette tokens,
Manrope + Inter typography, a "No-Line Rule" (boundaries via surface-color shifts,
never 1px borders), vertical indicator-pill sidebar navigation, and glassmorphism
for modals. Follow it exactly.

## User journeys (by priority)

### P1 — must have
1. **Login / Logout** — OAuth2 login screen; redirect to catalogue on success;
   session-expiry handling; logout from the nav bar.
2. **Browse Pet Catalogue** — Paginated card grid filtered by status
   (Available / Pending / Sold, default: Available). Client-side pagination with
   page controls ("Showing 1–12 of 48"), sort dropdown ("Sort by: Newest"),
   tag-based search, and a friendly empty state.
3. **View Pet Detail** — Full detail view (name, category, status, tags, photo
   gallery) reachable from any card. Back-navigation preserves filter state.
4. **Create Pet** — "Add Pet" form with sections: Core Identity (name [required],
   category, status), Discovery Tags (chip-based input — type + Enter to add,
   × to remove), Media Gallery (image upload with preview, JPG/PNG, max 5 MB).

### P2 — important
5. **Edit Pet** — Pre-populated edit form from the detail view; same validations
   as create; optimistic update.
6. **Delete Pet** — Confirmation dialog; handle 404 race condition ("This pet
   no longer exists").
7. **View Inventory** — Dashboard with 3 status-count cards (Available, Pending,
   Sold); each card links to the catalogue pre-filtered by that status.
   No charts or time-series in v1.
8. **Place Order** — From pet detail of an available pet; form with quantity
   (default 1); confirmation screen (order ID, status, ship date).

### P3 — optional / admin
9. **View & Cancel Orders** — Look up by numeric order ID; cancel only "placed"
   orders; disable cancel for "approved" / "delivered."
10. **User Management** — Admin-only section; CRUD on user accounts
    (username, name, email, phone, password); hidden from non-admin nav.

## Cross-cutting requirements
- User-friendly error messages for all failures (no raw status codes).
- Loading indicators within 200ms of any data fetch.
- Prevent double-submission on all write operations.
- Client-side form validation before API calls.
- Desktop + tablet; mobile is out of scope for v1.
- Extended pet attributes in wireframes (pricing, breed, weight, SKU, location)
  are aspirational only — v1 uses only fields present in the OpenAPI spec.
 ```

```text
Build a Petstore Web Console UI client that allows non-technical users to browse pets by status, view details, create/edit/delete pets, view inventory and create/cancel orders, and optionally manage users. The existing Petstore OpenAPI spec at https://petstore3.swagger.io/api/v3/openapi.json serves as the backend contract.
```

**If you cannot use GitHub yet:** Ask the instructor for the same prompt (and any handout) by email or chat; you can still read the public [Spec Kit](https://github.com/github/spec-kit) docs while access is sorted out.

---

## 2. Why Cursor

[Spec Kit](https://github.com/github/spec-kit) is built around **slash commands** in your AI-enabled editor (for example `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`). Cursor is a [supported environment](https://github.com/github/spec-kit/blob/main/README.md#-supported-ai-agents).

**Do this:**

1. Install [Cursor](https://cursor.com/) (use a **recent** build).
2. **File → Open Folder** and select the **repository root** (the folder that contains `.cursor` and `.specify`).
3. In the agent chat, confirm that **`/speckit`** commands autocomplete or appear when you type `/` (they are loaded from `.cursor/commands/`).

**Note:** Some users have reported occasional quirks between Spec Kit and certain Cursor versions. If something fails, try updating Cursor and re-test with a short `/speckit.specify` line plus your own one-sentence feature description. See [Spec Kit issues](https://github.com/github/spec-kit/issues) if you need to compare notes.

---

## 3. Spec Kit (Specify CLI) setup

Official flow is documented in the [Spec Kit README](https://github.com/github/spec-kit/blob/main/README.md) and [Specify CLI reference](https://github.com/github/spec-kit/blob/main/README.md#-specify-cli-reference).

### Prerequisite: `uv`

Install [uv](https://github.com/astral-sh/uv) (Astral’s Python package and tool runner). You need it to install the **Specify CLI** (`specify`).

### Install Specify CLI

Pin a **release tag** for reproducibility. Check [Spec Kit Releases](https://github.com/github/spec-kit/releases) for the current version; as of this writing the latest tag is **`v0.3.2`** (replace if newer):

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.3.2
```

Upgrade later with the [upgrade guide](https://github.com/github/spec-kit/blob/main/docs/upgrade.md) or `uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git@<tag>`.

### Two paths for this workshop

| Path | When to use | What |
|------|----------------|------|
| **A — Use this repo as-is** | Default for the session | Clone the instructor’s repo, open the repo root in Cursor. You **do not** need to run `specify init` if `.specify` and `.cursor` are already present. |
| **B — Greenfield (optional)** | You want to practice `specify init` on an empty folder | Run `specify init` from the [README](https://github.com/github/spec-kit/blob/main/README.md#-get-started). For **Cursor’s agent CLI**, upstream uses `--ai cursor-agent` (see [examples](https://github.com/github/spec-kit/blob/main/README.md#examples)). For other agents, see the `--ai` table in the same README—it changes over time. |

### Verify

```bash
specify check
```

In Cursor, try **`/speckit.constitution`** or **`/speckit.specify`** with a short line of text.

---

## 4. Stitch MCP (optional) + wireframes

### Wireframes (browser)

Open the Stitch project for the Petstore UI (read-only reference):

**[https://stitch.withgoogle.com/projects/823448846038334076](https://stitch.withgoogle.com/projects/823448846038334076)**

The sample spec calls out where **v1** scope differs from aspirational wireframe details—read the **Clarifications** section in [`specs/001-petstore-web-console/spec.md`](../../specs/001-petstore-web-console/spec.md).

### Stitch MCP in Cursor (optional)

The [`@_davideast/stitch-mcp`](https://www.npmjs.com/package/@_davideast/stitch-mcp) package connects Stitch designs to your IDE via MCP (proxy tools such as design context, `build_site`, `get_screen_code`, etc.).

**Recommended:** run the guided setup from your machine (handles authentication and client config):

```bash
npx @_davideast/stitch-mcp init
```

**Manual MCP entry** (if you configure Cursor yourself): add a server that runs the proxy, per [upstream docs](https://www.npmjs.com/package/@_davideast/stitch-mcp):

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@_davideast/stitch-mcp", "proxy"]
    }
  }
}
```

Place this under **Cursor Settings → MCP** (or merge into your user `mcp.json`), following the latest Cursor UI. If the wizard or package asks for tokens or secrets, **do not commit them**—keep them in Cursor’s environment or secure storage, not in the repo. If anything in the package differs from the above, **follow the package README** you get from `npm`.

---

## 5. Pre-work checklist

- [ ] **Git** installed; **Cursor** installed (recent version).
- [ ] Repository **cloned** from the URL your instructor shared; **workspace root** is the repo folder.
- [ ] **`uv`** installed; **`specify`** CLI installed (see §3) if you plan to run `specify check` or **Path B**.
- [ ] Slash commands **`/speckit.*`** available in Cursor.
- [ ] (Optional) **`npx @_davideast/stitch-mcp init`** completed and Stitch MCP enabled in Cursor.
- [ ] Wireframe link opened; skim **[`spec.md`](../../specs/001-petstore-web-console/spec.md)** clarifications.

---

## Security reminder

Do not commit API keys, tokens, or personal `.cursor/mcp.json` files that contain secrets. Treat them like production credentials.
