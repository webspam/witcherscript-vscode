# Game Directory

The language server needs your Witcher 3 install to resolve the base game scripts that your mod builds on. Without it, most features are of limited use - unknown types and members get flagged everywhere because the server has nothing to resolve them against.

## Auto-detection

On Windows, a **GOG Game of the Year** install is detected automatically through the GOG Galaxy registry. If it is found, the walkthrough shows a "Game directory detected" step and there is nothing to configure.

Steam and manual installs are not auto-detected and are routed through the walkthrough's setup step instead.

## Setting it manually

If your install was not detected, point the extension at it in any of these ways:

- The **Set your Witcher 3 game directory** walkthrough step ([Open Walkthrough](/reference/commands)).
- The WitcherScript [status bar](/guide/status-bar) menu.
- The `witcherscript.gameDirectory` setting directly.

The folder picker validates your choice: the selected folder must contain a `content` subdirectory, which is where the base game scripts live.

```json
{
  "witcherscript.gameDirectory": "C:\\games\\The Witcher 3 Wild Hunt GOTY"
}
```

## Shared Imports

Many modern Witcher 3 mods depend on **Shared Imports** (`modSharedImports`). When present, it is auto-loaded from `<gameDirectory>\Mods\modSharedImports` so the server can resolve the types those mods rely on.

This is on by default and controlled by `witcherscript.autoLoadModSharedImports`. Disable it to opt out:

```json
{
  "witcherscript.autoLoadModSharedImports": false
}
```

## Alternate base scripts (advanced)

Sometimes the base game scripts you want to check against are not under your game directory - for example, you keep a separate copy, or you want to switch between game versions (1.32 vs 4.04) without changing the game directory itself.

Two settings handle this:

- `witcherscript.baseScriptsDirectory` - the exact path to an alternate set of base scripts.
- `witcherscript.useBaseScriptsDirectory` - whether to use that alternate set instead of the game directory's scripts.

```json
{
  "witcherscript.baseScriptsDirectory": "C:\\witcher-scripts\\1.32\\scripts",
  "witcherscript.useBaseScriptsDirectory": true
}
```

::: warning This must be the scripts folder
`baseScriptsDirectory` must point at the actual `scripts` directory - the one containing the `core`, `engine`, and `game` subdirectories - not at a game directory.
:::

You can toggle `useBaseScriptsDirectory` on and off quickly from the **Alternate Scripts** button in the [status bar](/guide/status-bar) tooltip. While the alternate scripts are active, the status bar icon changes to a double-check ($(check-all)) so the override is visible at a glance.

::: info Scope of the override
This swaps only the base scripts folder, not the whole game directory. `redscripts.ini` and the automatic `modSharedImports` always use the versions in the Game Directory.
:::
