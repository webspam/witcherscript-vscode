# Getting Started

WitcherScript adds language support for The Witcher 3 `.ws` files in VS Code and Cursor: diagnostics, completion, hover, navigation, formatting, and more - all powered by the bundled [WitcherScript LSP](https://github.com/webspam/witcherscript-language).

## Install

Install **WitcherScript** from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript), or search for "WitcherScript" in the Extensions view (`Ctrl+Shift+X`).

## Requirements

- **Windows (x64).** The bundled language server is currently Windows-only.
- **A local Witcher 3 install (recommended).** Without one, most features are of limited use because the server cannot resolve the base game scripts.

::: info Workspace trust
The extension spawns a native binary and reads workspace files, so it is disabled in untrusted and virtual workspaces. Open your mod folder in a trusted workspace.
:::

## First-run setup

On first install, VS Code opens a **Get Started with WitcherScript** walkthrough that guides you through pointing the language server at your Witcher 3 install.

**GOG Game of the Year** installs are detected automatically; other installs can be configured from the walkthrough.

The walkthrough adapts its steps to your setup - if your game directory is auto-detected, the manual setup step is skipped. See [Walkthrough](/guide/walkthrough) for the full step list.

::: tip Next step
Point the server at your game so it can resolve base scripts: [Game Directory](/guide/game-directory).
:::

## Opening a project

1. Open a folder in VS Code / Cursor containing `.ws` files.
2. Open any `.ws` file to get diagnostics, hover, Go to Definition, and document symbols.

Folders with a `witcherscript.toml` manifest are detected automatically and indexed with no extra configuration.

## Quick commands

These two commands are available from the Command Palette (`Ctrl+Shift+P`):

- **WitcherScript: Open Walkthrough** - reopen the Get Started walkthrough after dismissing it.
- **WitcherScript: Restart Language Server** - restart the bundled language server.

See the [Commands reference](/reference/commands) for the full list.

## Language server

Language features are provided by the [WitcherScript LSP](https://github.com/webspam/witcherscript-language) (`witcherscript-language`), a Rust language server bundled with this extension. The pinned server version is included in each release of the extension - see the [Changelog](/changelog) for which server version each release bundles.
