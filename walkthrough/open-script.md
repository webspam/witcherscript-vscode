## Language features

Once the game directory is set, open any `.ws` file and the language server
provides:

- **Diagnostics** — errors and warnings as you type
- **Hover** — documentation for built-in and game types
- **Go to Definition** — jump to where a function or class is declared
- **Document symbols** — class and function outline in the Explorer panel

The language server runs in the background and logs to the *WitcherScript*
output channel. Adjust verbosity with `witcherscript.logLevel` if you need
more detail.
