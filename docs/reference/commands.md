# Commands Reference

All commands are contributed under the **WitcherScript** category. Most are invoked through the UI - code lenses, the status bar, the walkthrough, and Settings links - and are deliberately hidden from the Command Palette. Two are meant to be run from the palette directly.

## From the Command Palette

Open the palette with `Ctrl+Shift+P` and type "WitcherScript":

| Command                                | ID                              | Description                                                     |
| -------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| WitcherScript: Restart Language Server | `witcherscript.restartServer`   | Restart the bundled language server.                            |
| WitcherScript: Open Walkthrough        | `witcherscript.openWalkthrough` | Reopen the Get Started walkthrough after it has been dismissed. |

## Invoked through the UI

These commands exist but are hidden from the palette (`when: false`). They fire when you click the relevant UI element:

| Command                         | ID                                           | Invoked by                                                                         |
| ------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Go to Base Definition           | `witcherscript.goToBaseDefinition`           | The [overridden-symbols code lens](/guide/language-features#overridden-symbols).   |
| Show References                 | `witcherscript.showReferences`               | The [reference-count code lens](/guide/language-features#reference-counts).        |
| Add Additional Script Directory | `witcherscript.addAdditionalScriptDirectory` | The folder-picker link in Settings and the [walkthrough](/guide/walkthrough).      |
| Add Legacy Script Directory     | `witcherscript.addLegacyScriptDirectory`     | The folder-picker link in Settings and the walkthrough.                            |
| Show Output                     | `witcherscript.showOutput`                   | The [status bar](/guide/status-bar#tooltip-and-quick-menu) tooltip and quick menu. |
