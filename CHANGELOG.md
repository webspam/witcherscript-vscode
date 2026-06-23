# Changelog

## 0.9.0

Bundles `witcherscript-lsp v0.12.0`.

### Features

- A new `wsformat` command-line formatter formats `.ws` files or whole directories from the terminal, with a `--check` mode that lists unformatted files without rewriting them
- Formatting now reads a `.wsformat.toml` config; the `wsformat` CLI and the editor both pick up the nearest config in the directory tree and format identically
- Many more of the game's built-in enums are now recognised, so autocomplete and unknown-symbol warnings cover them
- Calls with the wrong number of arguments are now flagged, whether too many or a missing required (non-`optional`) one
- Using `parent` or `virtual_parent` outside a state is now flagged as an error
- Reading a struct field straight off a function's return value, e.g. `f().x`, is now flagged - store the result in a local first

### Improvements

- A long function call on the right of an assignment now wraps its arguments across lines, matching plain call statements

### Bug fixes

- Go-to-definition and type checking now work on a field accessed through an array element, e.g. the `.field` in `arr[i].field`
- Type checking and autocomplete now work when chaining member access through a `private` or `protected` field on `this`
- Cross-file errors now clear once you fix the file they came from, instead of lingering
- Member completion now works on a line with no trailing `;`, and no longer suggests the wrong members when typing before an existing `;`
- Editing a file rapidly no longer occasionally corrupts highlighting and error positions
- The formatter no longer drops skipped argument slots (e.g. `f(a, , b)`) when wrapping a long call
- `//` end-of-line comments no longer add or remove blank lines when formatting
- Gitignored and excluded files now stay ignored at startup, even when an editor tab for one is restored before the project finishes loading
- Closing a gitignored or excluded file no longer adds it to the project as a regular script

## 0.8.1

Bundles `witcherscript-lsp v0.10.1`.

### Improvements

- Hovering a `class` or `state` now shows its full keyword list, e.g. `abstract statemachine class Foo`

### Bug fixes

- The diagnostic for an override that weakens its inherited access modifier was inverted; it now flags the right overrides

## 0.8.0

Bundles `witcherscript-lsp v0.10.0`.

### Features

- Extract a selected expression to a new `var`, or selected statements to a new function or `private` method, ready to rename
- Inline a local to replace every use with its value and remove the declaration
- Split `var x : int = 5;` into a separate declaration and assignment, or join them back together
- Collapse a `switch` or `if`/`else` onto single lines, or expand each case or branch onto its own
- Jump to any class, function, or enum across your whole project with workspace symbols
- Put the cursor on a symbol to highlight every use of it in the file
- Call arguments now show the parameter name they fill, `out` parameters marked; control them with VS Code's `editor.inlayHints.enabled`
- A walkthrough tile lets you pick your inlay-hints mode, and existing users get a one-time prompt to choose it
- Unused locals, parameters, and private fields are now dimmed
- The editor now catches more mistakes as you type, including:
  - an override that weakens the access modifier it inherits
  - an override that changes the number of parameters
  - returning a value from an event other than `bool`
  - a `state` whose owner is not a `statemachine`
  - modifiers on a `@wrapMethod` function

### Improvements

- Hovering a method or function shows its full signature instead of just the name and parameters
- `@wrapMethod` completion now also offers methods already wrapped elsewhere in your project
- Autocomplete inside a state method now offers `parent` and `virtual_parent`
- The formatter leaves your own line breaks in long `+` and `&&` chains alone
- When a game directory isn't available, the default values for script globals (`redscripts.ini`) are used

### Bug fixes

- Switching git branches now clears stale errors from files you have open
- Hovering on variables that were defined as a list `var a, b, c : float` no longer shows the other vars
- A large project with many tabs open no longer hangs on startup

## 0.7.2

### Bug fixes

- The status bar no longer overflows its label when the language server is stopped or the game directory is not set.
- The description of the `witcherscript.formatter.compactColon` setting no longer misdescribes the spacing it produces.

## 0.7.1

### Bug fixes

- The `witcherscript.useBaseScriptsDirectory` toggle was inverted, so the alternate base scripts directory was used only when the option was off. It now applies the alternate directory when enabled and the game's scripts when disabled.

## 0.7.0

Bundles `witcherscript-lsp v0.8.0`.

### Features

- New `witcherscript.baseScriptsDirectory` setting overrides the base game scripts folder, for installs where it isn't under `witcherscript.gameDirectory` or to switch between game versions.
- New `witcherscript.useBaseScriptsDirectory` checkbox controls whether to use the alternate base scripts directory or not.  It can be quickly swapped via the "Alternate Scripts" button in the status bar tooltip.  The status bar icon changes to a double-check when alternate scripts are in use.
  - Note: This does not replace the game directory, only the scripts folder.  If you have a different `redscripts.ini` or a different version of `modSharedImports`, you'll need to set those manually.

### Improvements

- Large projects now complete diagnostics around to 5x faster.

### Bug fixes

- Type checking no longer flags false errors on `default` declarations of `CBehTreeVal` engine types.
- Using `new` on a `CBehTreeVal` engine value type is now correctly flagged as an error.

## 0.6.2

Bundles `witcherscript-lsp v0.7.2`.

### Bug fixes

- Syntax highlighting now always appears on files that were already open when you open a project, instead of sometimes showing no colours.
- Go-to-definition, type checking, and unknown-symbol warnings now work on the type named inside a cast, e.g. the `Foo` in `(Foo)value`.
- Autocompleting a function name after `@replaceMethod` now offers top-level global functions too, and no longer inserts a stray `wrappedMethod()` call.
- The Problems panel no longer jumps back to the top when clicking through the list.
- The formatter no longer moves `//` comments, and correctly indents statements broken across lines by one.

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
