# Workshop pre-read: Spec-Driven Development with Spec Kit (Cursor)

Complete this checklist **before** the session so you can follow along with slash commands, specs, and (optionally) Stitch design context.

---

## 1. Repository and “basic prompt”

**Instructor:** Push this repository to GitHub (or your org remote) and share the **clone URL** and **default branch** name.

**What to clone:** The full repository so you have:

- `.cursor/commands/` — `/speckit.*` slash commands
- `.specify/` — scripts, templates, and project constitution
- `specs/001-petstore-web-console/` — sample feature spec, plan, and tasks for the exercise

**Basic prompt** (copy-paste for `/speckit.specify` or discussion). This is the same **Input** described in [`specs/001-petstore-web-console/spec.md`](../../specs/001-petstore-web-console/spec.md):

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
