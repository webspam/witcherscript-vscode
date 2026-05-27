# WitcherScript

Language support for The Witcher 3 `.ws` files in VS Code and Cursor, powered by a bundled Rust language server.

## Features

- **Diagnostics** - syntax errors and validation warnings as you type
- **Completion** - members, symbols, and method snippets
- **Hover** - signatures and type annotations
- **Go to Definition** and **Find References**
- **Rename** - workspace-wide symbol renaming
- **Signature help** - parameter hints inside calls
- **Document Symbols** - outline in the Explorer panel
- **Semantic highlighting** - only highlights valid variable and type names
- **Document formatting** - opinionated pretty-printer with configurable line limit and alignment
- **Shared Imports auto-load** - picks up `modSharedImports` automatically when present (for type resolution)
- **Auto-detected projects** - folders with a `witcherscript.toml` manifest are indexed automatically, no config needed

## Requirements

- Windows (x64). The bundled language server is currently Windows-only.
- A local Witcher 3 install (recommended). Without one, most features will be of limited use.

## First-run setup

On first install, VS Code opens a **Get Started with WitcherScript** walkthrough that guides you through pointing the language server at your Witcher 3 install. GOG Game of the Year is detected automatically.

## Commands

- **WitcherScript: Open Walkthrough** - reopen the Get Started walkthrough after dismissing it
- **WitcherScript: Restart Language Server** - restart the bundled language server

## Language server

Language features are provided by the [WitcherScript LSP](https://github.com/webspam/witcherscript-language) (`witcherscript-language`), a Rust language server bundled with this extension.

## Platforms

Support is exclusively win x64 at present, but there should be no major blockers for porting.
