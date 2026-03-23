# Spec-driven development workshop (Spec Kit + Cursor)

Workshop materials: Petstore Web Console specs, [Spec Kit](https://github.com/github/spec-kit) layout (`.specify/`, `.cursor/commands/`), docs, and optional `frontend/` scaffold.

## Participant pre-work

See [docs/workshop/PREWORK.md](docs/workshop/PREWORK.md).

## Push this folder to GitHub

From this directory:

```bash
git init
git add .
git commit -m "Initial commit: SDD workshop materials"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

Replace the remote URL with your repository. If you use SSH, use `git@github.com:<org>/<repo>.git` instead.

## Note on MCP

`.cursor/mcp.json` is not copied into this bundle (it may contain secrets). Optional Stitch MCP setup is described in [docs/workshop/PREWORK.md](docs/workshop/PREWORK.md).
