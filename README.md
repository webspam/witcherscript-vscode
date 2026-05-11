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

You can also copy `.env.example` to `.env` and set `WITCHERSCRIPT_LSP_PATH`
there. This environment variable is only used while preparing the extension
package; the extension does not read it at runtime.

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
