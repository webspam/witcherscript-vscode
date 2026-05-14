# WitcherScript Language Features

Minimal VS Code/Cursor wrapper for the Rust `witcherscript-lsp` server.

This extension contributes the `witcherscript` language for `.ws` files, basic syntax
highlighting, and a bundled language server for diagnostics, document symbols, Go To
Definition, and hover. It is deliberately not a Witcher 3 mod management, packing,
deployment, or asset tool.

## Development

Install extension dependencies from this directory:

```powershell
npm install
```

For local language-server development, build `witcherscript-lsp` in the separate
`witcherscript-language` repo and point the packaging step at that binary:

```powershell
$env:WITCHERSCRIPT_LSP_PATH = "..\witcherscript-language\target\release\witcherscript-lsp.exe"
npm run prepare:server
```

You can also copy `.env.example` to `.env` and set `WITCHERSCRIPT_LSP_PATH` there. This environment variable is only for local development, used while preparing the extension package; the extension does not read it at runtime.

Package a local VSIX from this directory:

```powershell
npm run package
```

The package script copies `WITCHERSCRIPT_LSP_PATH` into `server/` when it is set.
Otherwise, it downloads the matching `witcherscript-lsp` release binary from
`https://github.com/webspam/witcherscript-language` and bundles it before running
`vsce package`.

At runtime, the editor setting `witcherscript.server.path` can override the
bundled `server/witcherscript-lsp` or `server/witcherscript-lsp.exe` binary.

## Game directory detection

The language server uses `witcherscript.gameDirectory` to locate the base game
scripts. When that setting is empty and the extension is running on Windows, it
falls back to the GOG installation path read from the registry key
`HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\GOG.com\Games\1495134320` (the GOG
Game of the Year edition). The detected path is validated and logged to the
WitcherScript output channel. This fallback only covers the GOG release; Steam
and other installs still require `witcherscript.gameDirectory` to be set
explicitly.
