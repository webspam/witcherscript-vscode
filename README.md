# WitcherScript Language Features

Minimal VS Code/Cursor wrapper for the Rust `witcherscript-lsp` server.

This extension contributes the `witcherscript` language for `.ws` files, basic syntax
highlighting, and a bundled language server for diagnostics, document symbols, Go To
Definition, and hover. It is deliberately not a Witcher 3 mod management, packing,
deployment, or asset tool.

## Development

Build the server from the repo root:

```powershell
cd parser
cargo build --bin witcherscript-lsp
```

Install extension dependencies from this directory:

```powershell
npm install
```

Package a local VSIX from this directory:

```powershell
npm run package -- --out witcherscript-language-features-0.1.0.vsix
```

The package script builds the release language server and copies it into `server/`
before running `vsce package`. If the server is not bundled or is in another location,
set `witcherscript.server.path` to the executable path.
