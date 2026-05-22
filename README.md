# WitcherScript

Language support for The Witcher 3 `.ws` files in VS Code and Cursor, powered by a bundled Rust language server.

## Features

- **Diagnostics** — syntax errors and validation warnings as you type
- **Completion** — members, symbols, and method snippets
- **Hover** — signatures and type annotations
- **Go to Definition** and **Find References**
- **Rename** — workspace-wide symbol renaming
- **Signature help** — parameter hints inside calls
- **Document Symbols** — outline in the Explorer panel
- **Semantic highlighting** — only highlights valid variable and type names
- **Document formatting** — opinionated pretty-printer with configurable line limit and alignment
- **Shared Imports auto-load** — picks up `modSharedImports` automatically when present (for type resolution)

## Requirements

- Windows (x64). The bundled language server is currently Windows-only.
- A local Witcher 3 install (recommended). Without one, the extension uses built-in base game scripts instead.

## First-run setup

On first install, VS Code opens a **Get Started with WitcherScript** walkthrough that guides you through pointing the language server at your Witcher 3 install. GOG Game of the Year is detected automatically.
