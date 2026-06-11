# WitcherScript

Language support for The Witcher 3 `.ws` files in VS Code and Cursor, powered by a bundled Rust language server. Available on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript) / [Open VSX](https://open-vsx.org/extension/webspam/witcherscript).

![Member completion after a dot](https://webspam.github.io/witcherscript-vscode/guide/completions-member.png)

## Getting started

After installing in VS Code, the **Get Started with WitcherScript** walkthrough opens. to guide you through pointing the language server at your Witcher 3 install, and configuring options.

> Reload the walkthrough at any time via Command Palette (`Ctrl+Shift+P`) -> **WitcherScript: Open Walkthrough**

## Documentation site

https://webspam.github.io/witcherscript-vscode/

Details on how to use & configure the extension.

## Features

- **Diagnostics** - syntax errors, type checking, and validation warnings as you type
- **Completion** - members, symbols, method and annotation snippets, etc
- **Hover** - signatures and type annotations
- **Go to Definition**, **Base Definition**, and **Find References**
- **Workspace symbols** - project-wide fuzzy search for classes, functions, and enums
- **Rename** - workspace-wide symbol renaming
- **Signature help** - parameter hints inside calls
- **Code actions** - quick fixes, switch/if-else layout toggles, and expression extraction
- **Code lens** - "go to base definition" links above overridden symbols and optional reference counts
- **Inlay hints** - parameter-name hints at call sites
- **Document Symbols** - outline in the Explorer panel
- **Document highlight** - highlights every read and write of a symbol in the file
- **Semantic highlighting** - only highlights valid variable and type names
- **Document formatting** - opinionated pretty-printer with configurable line limit and alignment
- **Shared Imports auto-load** - picks up `modSharedImports` automatically when present (for type resolution)
- **Auto-detected projects** - folders with a `witcherscript.toml` manifest are indexed automatically, no config needed

## Requirements

- Windows (x64). The bundled language server is currently Windows-only.
- A local Witcher 3 install (recommended). Without one, most features will be of limited use.

## Commands

- **WitcherScript: Open Walkthrough** - reopen the Get Started walkthrough after dismissing it
- **WitcherScript: Restart Language Server** - restart the bundled language server

## Language server

Language features are provided by the [WitcherScript LSP](https://github.com/webspam/witcherscript-language) (`witcherscript-language`), a Rust language server bundled with this extension.

## Platforms

Support is exclusively win x64 at present, but there should be no major blockers for porting.
