# Status Bar

## Extension status (bottom left)

A single status bar item surfaces the language server's health and your game-directory state at a glance.

| State                                                                                      | Appearance                                                                                                                                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running, game directory set                                                                | <span style="padding:0 0.25rem;display:flex;align-items:center;gap:0.25rem">$(check) WitcherScript</span>                                                  |
| Running, [alternate scripts](/guide/game-directory#alternate-base-scripts-advanced) active | <span style="padding:0 0.25rem;display:flex;align-items:center;gap:0.25rem">$(check-all) WitcherScript</span>                                              |
| Starting                                                                                   | <span style="padding:0 0.25rem;display:flex;align-items:center;gap:0.25rem">$(debug-disconnect) WitcherScript</span>                                       |
| Disconnected                                                                               | <span style="background: var(--vp-c-danger-soft); padding:0 0.25rem; display:flex;align-items:center;gap:0.25rem">$(debug-disconnect) WitcherScript</span> |
| No game directory                                                                          | <span style="background: var(--vp-c-warning-soft); padding:0 0.25rem; display:flex;align-items:center;gap:0.25rem">$(warning) WitcherScript</span>         |

### Tooltip and quick menu

The item has a rich markdown tooltip, and clicking it opens a quick-action menu. Both offer:

- **Restart language server** ([`witcherscript.restartServer`](/reference/commands))
- **Show output** - open the WitcherScript output channel
- **Open settings**
- **Alternate Scripts** - toggle the [alternate base scripts](/guide/game-directory#alternate-base-scripts-advanced) override (shown in tooltip when configured)

## Legacy file indicator $(replace)

When the active editor is a script loaded as a [legacy override](/guide/script-directories#legacy-script-directories), a separate status bar item appears in the bottom-right group, with a $(replace) icon and a warning-coloured background. Its tooltip lists which legacy directories matched the file and lets you remove a directory directly from the tooltip.
