# Contributing

## Setup

Install extension dependencies:

```powershell
npm install
```

## Local language-server development

Build `witcherscript-lsp` in the separate `witcherscript-language` repo and point the packaging step at the resulting binary:

```powershell
$env:WITCHERSCRIPT_LSP_PATH = "..\witcherscript-language\target\release\witcherscript-lsp.exe"
npm run prepare:server
```

Alternatively, copy `.env.example` to `.env` and set `WITCHERSCRIPT_LSP_PATH` there. This environment variable is only used while preparing the extension package; the extension does not read it at runtime.

At runtime, the editor setting `witcherscript.server.path` overrides the bundled `server/witcherscript-lsp` or `server/witcherscript-lsp.exe` binary.

## Packaging

```powershell
npm run package
```

The package script copies `WITCHERSCRIPT_LSP_PATH` into `server/` when it is set. Otherwise, it downloads the matching `witcherscript-lsp` release binary from `https://github.com/webspam/witcherscript-language` and bundles it before running `vsce package`.

## Checking your work

```powershell
npm run check
```

This runs `tsc --noEmit` on `src/` and `node --check` on `scripts/prepare-server.mjs`.

See [AGENTS.md](AGENTS.md) for project layout and additional conventions.
