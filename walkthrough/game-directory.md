## Game directory

The language server indexes the base game scripts that ship with Witcher 3 so it
can resolve built-in types, functions, and globals in your mods.

**GOG installs**: Skip this, unless you see errors.  GOG installs are detected
automatically. You can adjust this behaviour in settings.

Set `witcherscript.gameDirectory` to your Witcher 3 install root — the folder
that contains `bin/`, `content/`, and `Witcher3.exe`. For example:

```
C:\Games\The Witcher 3 Wild Hunt GOTY
```

Steam and other installs need the path set manually via the button above or by
editing `witcherscript.gameDirectory` in Settings.
