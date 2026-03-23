# petstore-web-console — Discovery

## Evidence model

This knowledge base is **spec-derived**: the repository does not yet contain `frontend/` or root `package.json`. Claims cite **feature specifications and contracts** under `specs/001-petstore-web-console/` (and related `.specify` artifacts). When application code exists, re-run stack/patterns/functional phases with file-and-line evidence.

**Implementation status:** `specified_only` — planned stack and behavior are documented; not verified against a built app.

---

## Auto-detection summary

| Signal | Result | Evidence |
|--------|--------|----------|
| Root `package.json` | Not found | Workspace root listing |
| `frontend/` per plan | Not present | [plan.md](../../specs/001-petstore-web-console/plan.md) § Project Structure |
| Java / .NET / Go / Rust | Not detected | No `pom.xml`, `*.sln`, `go.mod`, `Cargo.toml` at root |
| Monorepo tooling | Not detected | No `nx.json`, `pnpm-workspace.yaml`, etc. |
| CI/CD | Not detected | No `.github/workflows/`, `.gitlab-ci.yml`, etc. in repo |
| Containerization | Not detected | No `Dockerfile` in repo |
| Feature specs | Present | `specs/001-petstore-web-console/**` |

---

## User decisions (non-interactive defaults)

Equivalent to `skip-questions` per Reverse Spec 2.0 plan.

### A. Scope and boundaries

1. **Service name:** `petstore-web-console` (branch `001-petstore-web-console`, [spec.md](../../specs/001-petstore-web-console/spec.md)).
2. **Obsolete code:** None identified; no application modules exist yet.
3. **Generated code:** Planned: Orval output under `frontend/src/api/` — not in repo.
4. **Multi-module scope:** Document **entire repo** as one system; single planned SPA + external Petstore API.

### B. Database and schema

5. **Database access:** **E — No local database.** Persistence via Petstore REST API only ([data-model.md](../../specs/001-petstore-web-console/data-model.md) introduction).
6. **Database type(s):** N/A locally; remote API is REST over HTTPS.
7. **Schema sensitivity:** **User** entity may contain PII (username, email, names, phone) per [data-model.md](../../specs/001-petstore-web-console/data-model.md) Entity: User.

### C. Runtime and environment

8. **Target environments:** **D — Document what config suggests:** local dev for SPA; hosting/CDN **unknown** (no pipeline files).
9. **Current deployment:** **F — Inferred from docs:** browser client to public Petstore API; static hosting not specified.

### D. Documentation goals

10. **Audience:** **B — Human developers + AI agents** (balanced).
11. **Existing documentation:** **A — Yes:** `specs/001-petstore-web-console/`, [.specify/memory/constitution.md](../../.specify/memory/constitution.md).

---

## Related outputs

- Config: [../.reverse-spec.yml](../.reverse-spec.yml)
- Next: [../stack/STACK.md](../stack/STACK.md)

---

*Full scan phase: discovery — 2026-03-23*
