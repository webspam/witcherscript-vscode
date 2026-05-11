# Agent Instructions

## Committing

Commit changes as you make them — one logical change per commit. Don't batch unrelated edits into a single commit.

## Project layout

| Path | Purpose |
|------|---------|
| `extension.js` | VS Code extension entry point; starts the LSP client |
| `package.json` | Extension manifest, npm scripts, contributed settings |
| `language-configuration.json` | Comment style, bracket pairs for `.ws` files |
| `syntaxes/witcherscript.tmLanguage.json` | TextMate grammar for syntax highlighting |
| `scripts/prepare-server.js` | Build-time script that copies or downloads the LSP binary |
| `.env.example` | Template for local env overrides (copy to `.env`) |

## No transpilation

The extension ships `extension.js` as-is. There is no TypeScript compilation or bundler step. Edit `extension.js` directly.

## Checking your work

```
npm run check
```

This runs `node --check` on `extension.js` and `scripts/prepare-server.js`. Run it after any JS changes to catch syntax errors.

## LSP binary

The `server/` directory (gitignored) holds the `witcherscript-lsp` binary at runtime. It is populated by `npm run prepare:server`, which either copies `WITCHERSCRIPT_LSP_PATH` or downloads the matching release asset from the `webspam/witcherscript-language` GitHub repo. Never commit the `server/` directory or its contents.

## Packaging

Only needed when producing a `.vsix` for distribution — not required for code changes:

```powershell
npm run package
```

The package script calls `prepare:server` automatically.

## What this extension is not

This extension does not manage Witcher 3 mods, pack content, deploy to the game, or handle assets. Keep changes scoped to language features: syntax highlighting, LSP client wiring, and editor configuration.
