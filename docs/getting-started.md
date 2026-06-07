# Getting Started

WitcherScript adds language support for The Witcher 3 `.ws` files in VS Code and Cursor, powered by a bundled Rust language server.

## Install

Install **WitcherScript** from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript), or search for "WitcherScript" in the Extensions view (`Ctrl+Shift+X`).

## Requirements

- **Windows (x64).** The bundled language server is currently Windows-only.
- **A local Witcher 3 install (recommended).** Without one, most features are of limited use.

## First-run setup

On first install, VS Code opens a **Get Started with WitcherScript** walkthrough that guides you through pointing the language server at your Witcher 3 install. GOG Game of the Year installs are detected automatically; other installs can be configured from the walkthrough.

## Commands

- **WitcherScript: Open Walkthrough** - reopen the Get Started walkthrough after dismissing it.
- **WitcherScript: Restart Language Server** - restart the bundled language server.

## Language server

Language features are provided by the [WitcherScript LSP](https://github.com/webspam/witcherscript-language) (`witcherscript-language`), a Rust language server bundled with this extension.
