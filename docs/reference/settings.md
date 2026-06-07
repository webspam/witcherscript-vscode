<style>
.vp-doc abbr { text-decoration: none; cursor: help; }
</style>

# Settings

All settings live under **WitcherScript** in VS Code's Settings editor (`Ctrl+,`), and can also be edited directly in `settings.json`. The setting ID for each is shown in `code`.

## Diagnostics & code lenses

### Diagnostics scope

How much of your project is checked for errors: the whole workspace (default), only the files you have open, or nothing at all. See [Diagnostics scope](/guide/language-features#diagnostics-scope).

Setting: `witcherscript.diagnostics.scope`

### Game definition lens

A clickable link above symbols in a legacy override script that jumps to the original base game definition. On by default.

Setting: `witcherscript.codeLens.overriddenSymbols`

### Reference count lens

Shows how many times each top-level declaration and class method is used, right above it in the editor. Off by default.

Setting: `witcherscript.codeLens.references`

## Game & scripts

### Game directory

Where The Witcher 3 is installed. The language server reads the base game scripts from here, so most features need it set. See [Game Directory](/guide/game-directory).

Setting: `witcherscript.gameDirectory`

### Auto-load Shared Imports

Automatically loads the Shared Imports mod when it is found in your game's `Mods` folder, since most modern mods depend on it. On by default; turn it off to skip it.

Setting: `witcherscript.autoLoadModSharedImports`

### Additional script directories

Extra folders of mod scripts to read, for mods that _add_ new `.ws` files you depend on. See [Script Directories](/guide/script-directories).

Setting: `witcherscript.additionalScriptDirectories`

### Legacy script directories

Folders whose scripts _replace_ base game scripts of the same name, for older mods that include edited copies of vanilla files.

Setting: `witcherscript.legacyScriptDirectories`

### Alternate base scripts

An advanced pair for checking against a different set of base scripts (for example, to switch between game versions) without changing your game directory. Set the path with `witcherscript.baseScriptsDirectory`, then turn it on with `witcherscript.useBaseScriptsDirectory` (usually from the [status bar](/guide/status-bar)). See [Alternate base scripts](/guide/game-directory#alternate-base-scripts-advanced).

## Formatter

See [Formatting](/guide/formatting)

## Advanced

### Log level

How much detail the language server writes to its output channel. Raise it to `debug` or `trace` when troubleshooting.

Setting: `witcherscript.logLevel`

### Server path

Point at your own `witcherscript-lsp` binary instead of the bundled one. Leave empty to use the bundled server.

Setting: `witcherscript.server.path`

### Server TCP port

For development: connect to a language server you are running yourself on a local port. Leave at `0` to use the bundled server.

Setting: `witcherscript.server.tcpPort`
