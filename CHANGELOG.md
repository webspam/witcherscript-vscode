# Changelog

## 0.3.0

First public release. Everything the extension ships is listed below.

### Language features (via bundled `witcherscript-lsp v0.3.2`)

- Diagnostics: parse errors, unknown types, unknown members, unknown functions, unknown methods, unknown identifiers, duplicate top-level symbols, duplicate locals and parameters, `var` declarations after executable statements, locals or parameters that shadow class fields or `redscripts.ini` globals, missing or duplicate `wrappedMethod(...)` calls inside `@wrapMethod` bodies, and ternary-expression warnings (the compiler folds them to `0` / `false` / `void`).
- Hover with type signatures, annotations, and file:line links.
- Go to Definition, across files.
- Find References, workspace-wide.
- Rename, workspace-wide; rejected on read-only base game scripts.
- Document Symbols outline with nested classes, structs, enums, functions, methods, states, events, and fields.
- Signature Help with active-parameter tracking.
- Completion for members (via `.` and `:`), types, locals, `this`-shorthand members, globals, statement keywords, and modding-annotation parameters. Function and method completions expand to snippets with parameter placeholders.
- Semantic highlighting with 13 token types covering classes, enums, enum members, functions, parameters, variables, properties, keywords, comments, strings, numbers, decorators, and modifiers.
- Document formatting with configurable line limit and colon style.
- Witcher 3 modding awareness: annotated functions skip the duplicate-top-level-symbol check; `@wrapMethod` and `@replaceMethod` additionally skip shadowing and duplicate-local checks.
- Built-in `array<T>` generic with the standard methods (`PushBack`, `PopBack`, `Insert`, `Erase`, `EraseFast`, `Clear`, `Size`, `Last`, `Contains`, `FindFirst`, `Grow`, `Remove`, `Resize`).
- UTF-8, UTF-16 LE, and UTF-16 BE script files, matching the encodings Witcher 3 ships.

### Editor support

- `.ws` language registration with TextMate grammar covering control-flow and storage keywords, access and function modifiers, declarations, language variables and constants, `CName` literals, hex and float literals, operators, primitive types and aliases (`bool`/`Bool`, `Int8`/`Int32`, `Uint64`, `float`/`Float`, `string`/`String`, `name`/`CName`, `byte`/`Byte`, `void`), `@Annotation()` syntax, and `array<T>` generics.
- Bracket matching, auto-close pairs, and line (`//`) and block (`/* */`) comment toggling.

### Game directory and script loading

- Built-in base game scripts are served from the extension when the user has not pointed `witcherscript.gameDirectory` at an install.
- Automatic detection of the GOG Game of the Year install on Windows via the Galaxy registry; Steam and manual installs are routed through the walkthrough.
- Auto-loads `modSharedImports` from the game's `Mods` directory when present — the dependency most modern Witcher 3 mods rely on.
- Additional read-only script roots can be added with `witcherscript.additionalScriptDirectories` for co-dependent mod development.
- Legacy script directories (`witcherscript.legacyScriptDirectories`) for folders whose `.ws` files replace the game's built-in script of the same name instead of clashing with it — for older mods that overwrite base game scripts. A base-script-conflict diagnostic offers a quick fix that adds the offending folder to this setting.

### Status bar and onboarding

- Unified status bar item that surfaces LSP health (starting, running, stopped) and game-directory state, with a quick-action menu for restart, open output, set game directory, and open settings.
- First-run walkthrough ("Get Started with WitcherScript") that adapts its steps based on whether the game directory was auto-detected.
- Per-file indicator showing whether the active script is loaded as a legacy override, with an interactive tooltip linking to the legacy directory settings.
- Optional busy spinner shown while the language server is processing a request, gated behind the hidden `witcherscript.showBusySpinner` setting.

### Commands

- `witcherscript.restartServer` — restart the language server.
- `witcherscript.setGameDirectory` — pick the Witcher 3 install folder with validation; surfaced via the status menu and walkthrough, hidden from the command palette.
- `witcherscript.showStatusMenu` — open the status bar quick-action menu.

### Settings

- `witcherscript.gameDirectory` — path to the Witcher 3 install.
- `witcherscript.additionalScriptDirectories` — extra read-only script roots.
- `witcherscript.legacyScriptDirectories` — script roots whose `.ws` files override base game scripts of the same name.
- `witcherscript.autoLoadModSharedImports` — toggle auto-loading of `modSharedImports`.
- `witcherscript.formatter.lineLimit` — target line length before wrapping (default `100`).
- `witcherscript.formatter.compactColon` — omit spaces around type-annotation colons.
- `witcherscript.formatter.alignMemberColons` — vertically align colons in consecutive field declarations.
- `witcherscript.server.path` — override the bundled LSP binary.
- `witcherscript.server.tcpPort` — connect to an externally running LSP on `localhost`; the server restarts automatically when this changes.
- `witcherscript.logLevel` — `error` / `warn` / `info` (default) / `debug` / `trace`.

### Distribution

- Windows x64 build with `witcherscript-lsp v0.3.2` bundled.
- Workspace trust required: the extension is marked unsupported in untrusted and virtual workspaces because it spawns a native binary and reads workspace files.
