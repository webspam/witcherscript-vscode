# Agent Instructions

## Code style

Before writing any code, you must have read [code style](CODESTYLE.md).

## Committing

Commit changes as you make them — one logical change per commit. Don't batch unrelated edits into a single commit.
This keeps `git bisect` useful and makes the history easy to read.

Commit messages have a 50 character limit.

## Project layout

| Path                                     | Purpose                                                   |
| ---------------------------------------- | --------------------------------------------------------- |
| `src/extension.ts`                       | VS Code extension entry point; starts the LSP client      |
| `dist/`                                  | Bundled JS output (gitignored); shipped in `.vsix`        |
| `esbuild.mjs`                            | esbuild build script (dev + production bundling)          |
| `tsconfig.json`                          | TypeScript compiler config (type-check only, no emit)     |
| `package.json`                           | Extension manifest, npm scripts, contributed settings     |
| `language-configuration.json`            | Comment style, bracket pairs for `.ws` files              |
| `syntaxes/witcherscript.tmLanguage.json` | TextMate grammar for syntax highlighting                  |
| `scripts/prepare-server.mjs`              | Build-time script that copies or downloads the LSP binary |
| `.env.example`                           | Template for local env overrides (copy to `.env`)         |
| `.vscode/*.example`                      | Templates for personal `launch.json` / `tasks.json`       |

## Building

```
npm run compile   # one-shot dev bundle into dist/extension.js
npm run watch     # esbuild --watch for iterative development
```

The extension's `main` is `dist/extension.js`. `vsce package` triggers `vscode:prepublish`, which type-checks and runs the production esbuild bundle. The bundle inlines `vscode-languageclient` and its transitive deps, so `node_modules` is excluded from the `.vsix`. `vscode` is marked external (the Extension Host provides it).

## Checking your work

```
npm run check
```

Runs `tsc --noEmit` for type checking and `node --check` on the JS build scripts. Run after any code changes. esbuild strips types without checking them, so tsc is the source of truth for type errors.

## LSP binary

The `server/` directory (gitignored) holds the `witcherscript-lsp` binary at runtime. It is populated by `npm run prepare:server`, which either runs `just release` in `WITCHERSCRIPT_LSP_PATH` (the LSP repo root) and copies the built binary from `target/release/`, or downloads the pinned release asset from the `webspam/witcherscript-language` GitHub repo. Never commit the `server/` directory or its contents.

## Packaging

Only needed when producing a `.vsix` for distribution — not required for code changes:

```powershell
npm run package
```

The package script calls `prepare:server` automatically.

## What this extension is not

This extension does not manage Witcher 3 mods, pack content, deploy to the game, or handle assets. Keep changes scoped to language features: syntax highlighting, LSP client wiring, and editor configuration.
