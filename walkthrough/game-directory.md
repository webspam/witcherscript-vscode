## Game directory

The language server indexes the base game scripts that ship with Witcher 3 so it
can resolve built-in types, functions, and globals in your mods.

Set `witcherscript.gameDirectory` to your Witcher 3 install root — the folder
that contains `bin/`, `content/`, and `Witcher3.exe`. For example:

```
C:\Games\The Witcher 3 Wild Hunt GOTY
```

**GOG installs on Windows are detected automatically** from the registry, so you
may not need to do anything here. Check the *WitcherScript* output channel if
detection ran — it logs the path it found.

Steam and other installs need the path set manually via the button above or by
editing `witcherscript.gameDirectory` in Settings.
