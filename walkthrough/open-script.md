## Open a WitcherScript file

With the game directory set, open any `.ws` file and the language server takes
over — diagnostics appear as you type, hover and completion read from the base
game scripts, and the formatter is available via **Format Document**.

The first open after a fresh install takes a few seconds while the server
indexes the base game scripts. Subsequent files are instant.

The server runs in the background and logs to the *WitcherScript* output
channel. If something looks wrong, raise the verbosity with
`witcherscript.logLevel` and check the channel for clues.
