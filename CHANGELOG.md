# Changelog

## 0.6.1

Bundles `witcherscript-lsp v0.7.1`.

### Bug fixes

- Startup no longer shows a flash of false-positive errors before the base-game scripts finish indexing.

## 0.6.0

Bundles `witcherscript-lsp v0.7.0`.

### Features

- Full type checking: the editor now flags type mismatches across assignments, variable initializers, and call arguments / returns, following the conversions the WitcherScript compiler actually allows.
- A getting-started walkthrough helps first-time modders decide whether to enable the code lens features.

### Improvements

- After `@wrapMethod(Class)`, the class's overridable methods are offered immediately, with `function` filled in for you.
- The Problems list no longer resets and reorders while you browse between files.
- A long-running request (e.g. diagnostics on base-game scripts) no longer delays other requests.

### Bug fixes

- Various minor diagnostics inconsistencies are resolved.

## 0.5.2

Bundles `witcherscript-lsp v0.6.3`.

### Improvements

- `switch` statements format with cleaner indentation and column alignment, respecting how you wrote single- vs multi-line.
- Boolean conditions split across lines with `&&` / `||` keep their line breaks instead of being collapsed.

### Bug fixes

- "N references" code lens counts are now accurate.
- Find All References finds `@wrapMethod` targets declared in base-game scripts.
- Formatter no longer misaligns fields around comments, and keeps correct spacing when a call skips an optional argument.

## 0.5.1

Bundles `witcherscript-lsp v0.6.2`.

### Improvements

- Quieter language server: log sites triggered by normal editing no longer spam the output.

### Bug fixes

- Formatter no longer drops, misplaces, or corrupts comments, including end-of-line comments.

## 0.5.0

Bundles `witcherscript-lsp v0.6.0`.

### Features

- Go to Type Definition: jump from a variable, field, or return type to its type's declaration. Generics target the constructor (`array<CFoo>` -> `array`), enum members target their owning enum, and primitives produce no target.
- Block comment auto-continuation: pressing Enter inside a `/* */` block starts the next line with ` * `.
- Formatter line-break control via two settings, each offering `preserve` (default), `ownLine`, and `sameLine` modes: `witcherscript.formatter.annotationPlacement` for `@addField`, and `witcherscript.formatter.defaultPlacement` for `default` initializers (with column alignment).
- Code lenses on declarations, independently toggleable: a "game definition" lens above symbols in legacy override files (`witcherscript.codeLens.overriddenSymbols`, on by default) and an "N references" lens above declarations and class methods (`witcherscript.codeLens.references`, off by default).
- `wrappedMethod` navigation: Go to Definition, hover, and find-all-references inside a `@wrapMethod` body now target the wrapped method.

### Improvements

- Status bar item now shows a rich markdown tooltip.
- Text-file reads are encoding-aware (UTF-8 / UTF-16 LE / BE with BOM sniffing).
- Reduced debug log spam from the language server.

### Bug fixes

- Completions appear immediately on typing, and no longer trigger inside comments.
- Go to Definition works at the end of a line.
- Formatter no longer discards edited text, with spacing fixes for casts, operators, and generics.
- Diagnostics no longer flicker.

## 0.4.3

Bundles `witcherscript-lsp v0.5.1-alpha.0`.

### Improvements

- Rapid edits (hold-paste, burst typing) no longer freeze the editor or peg CPU. Parse and index work now runs off the LSP event loop, edit bursts coalesce to 1-2 parses instead of one per keystroke, and small changes in large files re-parse only the changed region.
- Switched to LSP pull diagnostics. VS Code now requests diagnostics for visible editor tabs (including built-in / read-only script tabs) on demand, instead of relying on server-pushed updates.

### Bug fixes

- Ini globals (`thePlayer`, `theGame`, etc.) now highlight as variables with the `defaultLibrary` modifier, instead of as classes. A workspace class with the same name still wins and highlights as a class.

## 0.4.1

Bundles `witcherscript-lsp v0.5.0`.

### Features

- Opening a folder with a `witcherscript.toml` manifest now Just Works; the LSP auto-detects it and indexes `scripts_root` with no config changes required (opt out via `witcherscript.detectProjectManifests`).
- New diagnostic: using a type name (class, struct, state, enum) where a value is expected now flags as an error (e.g. `x = MyClass`, `EnumGetMin(ESomeEnum)`).
- Filled in missing members across all synthetic engine enum definitions; `EInputKeys` (264 members) and `EShowFlags` extracted into their own files.

### Improvements

- Completions for global symbols, types, and enum members are now cached, and are more responsive and power-efficient.
- Hover text now correctly says "enum member" instead of "enum variant".
- For-loops with comma-separated init/update clauses now parse correctly.

### Bug fixes

- `Sleep()` and other function calls no longer false-flag as `type_used_as_value` when a state shares the name; `this`, `super`, and `extends` inside states also resolve correctly in the presence of same-named functions or classes.
- Semantic highlighting no longer flickers or shows half-coloured symbols after fast edits or cut/paste.
- Files inside gitignored directories are now excluded from the workspace.
- Formatting a file no longer silently deletes certain expressions that contained parse errors.
- Engine enum members (e.g. `AD_Front`) now appear in completion results; they were previously missing from merged completions.
- Several correctness fixes around legacy script suppression: stale parse errors after override apply or remove, false `find references` hits from same-name locals in shadowed vanilla files, and stale suppress maps right after opening a legacy file.

### Distribution

- Pre-release VSIX is now published to the marketplace via the release workflow.

## 0.4.0

Bundles `witcherscript-lsp v0.4.1`.

### Features

- Get Started walkthrough now has two new steps that guide users through adding mod dependencies instead of leaving the settings to be discovered: "Add scripts from other mods" (for mods that add new `.ws` files) and "Add legacy script overrides" (for older mods that ship edited copies of base game scripts). Both include a folder-picker button that saves the selection to workspace settings.
- New `WitcherScript: Open Walkthrough` command, so the Get Started walkthrough can be reopened after it has been dismissed.
- New diagnostics: private member access, instantiating an abstract class with `new`, and using `super.` to access fields.
- Completions are now offered for `new SomeClass in this`.

### Bug fixes

- Removing a duplicate function or class no longer breaks completion and diagnostics for the remaining copy.

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
- Both `witcherscript.additionalScriptDirectories` and `witcherscript.legacyScriptDirectories` show an "Add folder (Workspace)…" link in their Settings UI description that opens a folder picker, so paths don't have to be typed by hand.

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
