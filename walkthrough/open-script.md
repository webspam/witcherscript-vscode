## Language features

Once the game directory is set, open any `.ws` file and the language server
provides:

- **Completion** — members, symbols, and method snippets
- **Signature help** — parameter hints inside calls
- **Hover** — signatures and type annotations
- **Go to Definition** and **Find References**
- **Rename** — workspace-wide
- **Document formatting** — opinionated pretty-printer
- **Diagnostics** — syntax errors and validation warnings as you type
- **Document Symbols** — outline in the Explorer panel
- **Semantic highlighting** — only highlights valid types

The language server runs in the background and logs to the *WitcherScript*
output channel. Adjust verbosity with `witcherscript.logLevel` if you need
more detail.
