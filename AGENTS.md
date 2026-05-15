# Agent Instructions

## Committing

Commit changes as you make them — one logical change per commit. Don't batch unrelated edits into a single commit.

Commit messages have a 50 character limit.

## Project layout

| Path                                     | Purpose                                                   |
| ---------------------------------------- | --------------------------------------------------------- |
| `src/extension.ts`                       | VS Code extension entry point; starts the LSP client      |
| `out/`                                   | Compiled JS output (gitignored); shipped in `.vsix`       |
| `tsconfig.json`                          | TypeScript compiler config                                |
| `package.json`                           | Extension manifest, npm scripts, contributed settings     |
| `language-configuration.json`            | Comment style, bracket pairs for `.ws` files              |
| `syntaxes/witcherscript.tmLanguage.json` | TextMate grammar for syntax highlighting                  |
| `scripts/prepare-server.js`              | Build-time script that copies or downloads the LSP binary |
| `.env.example`                           | Template for local env overrides (copy to `.env`)         |

## Building

```
npm run compile   # one-shot tsc build into out/
npm run watch     # tsc --watch for iterative development
```

The extension's `main` is `out/extension.js`. `vsce package` triggers `vscode:prepublish` → `compile` automatically. There is no bundler — `tsc` emits plain CommonJS that VS Code's Node host loads directly.

## Checking your work

```
npm run check
```

This runs `tsc --noEmit` on `src/` and `node --check` on `scripts/prepare-server.js`. Run it after any code changes.

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
