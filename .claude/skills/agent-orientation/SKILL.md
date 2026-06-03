---
name: agent-orientation
description: Get up to speed fast on this repo - a VS Code extension. Use at the start of a fresh context window to learn the project, where things live, expected expertise, and primary docs to research.
---

# Quick Start

Orientation for working in **witcherscript-vscode**. Read this first in a new context window.

## What this is

A **VS Code extension** ("WitcherScript", `displayName`) providing language support for The Witcher 3 `.ws` files. It is a thin LSP **client**: it launches a bundled Rust language server (`witcherscript-lsp`) and wires it into VS Code. All real language intelligence (diagnostics, hover, completion, formatting) lives in the **server**, not here.

It is **not** a mod manager - no asset packing, no game deployment. Keep changes scoped to language features, LSP client wiring, and editor configuration.

Client-side features layered on the server: code lenses (overridden-symbol links, reference counts), Go to Base Definition / Show References commands, a getting-started walkthrough, game-directory detection, and legacy/additional script-directory management. Server behaviour (formatter, diagnostics scope, log level) is surfaced as `witcherscript.*` settings but executed in the Rust server.

The Rust server lives in a separate repo: `https://github.com/webspam/witcherscript-language`.

## Expertise expected

You are an **expert VS Code extension author** writing **TypeScript**. That means:

- Fluent with the `vscode` API: `ExtensionContext`, `context.subscriptions` disposal, commands, status bar items, configuration, context keys, walkthroughs, output channels.
- Fluent with `vscode-languageclient` (LSP client lifecycle, server transports).
- TypeScript `strict` mode. Follow [CODESTYLE.md](../../../CODESTYLE.md): return type annotations always, never `void` on Promises, named functions over closures, comments only for non-obvious *why*.

## Where things live

| Need to... | Look at |
| --- | --- |
| Understand activation flow | [src/extension.ts](../../../src/extension.ts)|
| Change LSP client wiring | [src/client.ts](../../../src/client.ts) |
| Touch game-directory detection | [src/gameDirectory.ts](../../../src/gameDirectory.ts) |
| Status bar UI | [src/statusBar.ts](../../../src/statusBar.ts), [src/legacyScriptStatus.ts](../../../src/legacyScriptStatus.ts) |
| Legacy/additional script dir commands | [src/scriptDirCommands.ts](../../../src/scriptDirCommands.ts) |
| Built-in base game scripts | [src/builtinContent.ts](../../../src/builtinContent.ts) |
| Typed command/config/displayName constants (generated) | [src/generated-meta.ts](../../../src/generated-meta.ts) |
| Add a command / setting / walkthrough step | `contributes` block in [package.json](../../../package.json) |
| Syntax highlighting | [syntaxes/witcherscript.tmLanguage.json](../../../syntaxes/witcherscript.tmLanguage.json), [language-configuration.json](../../../language-configuration.json) |
| Server binary build/download | [scripts/prepare-server.mjs](../../../scripts/prepare-server.mjs) |

Bundled JS lands in `dist/` (gitignored; `main` is `./dist/extension.js`). The server binary lives in `server/` (gitignored) - never commit either.

## Build & check

```powershell
npm run compile   # one-shot esbuild bundle into dist/
npm run watch     # esbuild --watch for iterative work
npm run gen:meta  # regenerate src/generated-meta.ts from the package.json contributes block
npm run check     # gen:meta + tsc --noEmit + node --check on prepare-server.mjs and esbuild.mjs - run after every change
```

Bundled with **esbuild** ([esbuild.mjs](../../../esbuild.mjs)) into CommonJS loaded by VS Code's Node host.

## Research online

When you need guidance, go to primary sources, not blog posts:

- **VS Code Extension API** - https://code.visualstudio.com/api (guides) and https://code.visualstudio.com/api/references/vscode-api (full API reference).
- **Extension manifest / `contributes`** - https://code.visualstudio.com/api/references/extension-manifest and https://code.visualstudio.com/api/references/contribution-points
- **`when` clause context keys** - https://code.visualstudio.com/api/references/when-clause-contexts
- **Language Server Protocol** - https://microsoft.github.io/language-server-protocol/ (spec) and the `vscode-languageclient` npm package docs.
- **TypeScript handbook** - https://www.typescriptlang.org/docs/

Pin claims to the API version in [package.json](../../../package.json) `engines.vscode` (currently `^1.85.0`).
