# Script Directories

Beyond the base game and Shared Imports, your project often needs scripts from other mods. WitcherScript distinguishes two kinds of mod scripts, and using the right setting matters - they are resolved differently.

## Additional vs legacy

|                  | Additional script directories              | Legacy script directories                              |
| ---------------- | ------------------------------------------ | ------------------------------------------------------ |
| Setting          | `additionalScriptDirectories`              | `legacyScriptDirectories`                              |
| For mods that... | **add** new `.ws` files                    | **replace** base game scripts                          |
| Same-name script | clashes with the game's own                | **shadows** the game's own (yours wins)                |
| Typical case     | shared utilities, frameworks you depend on | older mods containing edited copies of vanilla scripts |

Both scan the folder and its subfolders, and both are read-only roots: the server reads them for resolution but does not treat them as editable project files.

## Additional script directories

Use this for **modern mods that add new scripts** - shared utilities, frameworks, anything your scripts call into that includes its own new `.ws` files.

```json
{
  "witcherscript.additionalScriptDirectories": ["C:\\mods\\SharedUtils\\content\\scripts"]
}
```

## Legacy script directories

Use this for **older mods that overwrite base game scripts** - mods that include edited copies of vanilla files rather than adding new ones. A script found in a legacy directory replaces the game's built-in script of the same name instead of colliding with it.

```json
{
  "witcherscript.legacyScriptDirectories": ["C:\\mods\\modLegacyTweaks\\content\\scripts"]
}
```

::: tip Conflict quick fix
If a folder's `.ws` files clash with base game scripts of the same name, a base-script-conflict diagnostic offers a quick fix that adds the offending folder to `legacyScriptDirectories` for you.
:::

## Adding folders without typing paths

Both settings show an **Add folder (Workspace)…** link in their Settings UI description. Clicking it opens a folder picker and saves the selection to your **workspace** settings, so paths do not have to be typed by hand. The same pickers are surfaced as buttons in the [walkthrough](/guide/walkthrough).

The matching commands - `witcherscript.addAdditionalScriptDirectory` and `witcherscript.addLegacyScriptDirectory` - are invoked through those links and buttons, not from the Command Palette.

## Legacy file indicator

When the active editor is a script that is loaded as a legacy override, a dedicated [status bar](/guide/status-bar#legacy-file-indicator) item appears with a $(replace) icon. Its tooltip shows which legacy directories matched the file and lets you remove a directory directly from the tooltip.
