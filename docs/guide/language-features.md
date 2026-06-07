# Language Features

Everything on this page is provided by the bundled [WitcherScript LSP](https://github.com/webspam/witcherscript-language). Open any `.ws` file in a project with a configured [game directory](/guide/game-directory) to use them.

## Diagnostics

Syntax errors and validation warnings appear as you type:

- Parse errors
- Type mismatches
- Unknown types, members, functions, methods, and identifiers
- Duplicate top-level symbols
- Duplicate locals and parameters
- `var` declarations after executable statements
- Locals or parameters that shadow class fields or `redscripts.ini` globals
- Missing or duplicate `wrappedMethod(...)` calls inside `@wrapMethod` bodies
- ... and more.

Full type checking flags type mismatches across assignments, variable initializers, and call arguments and returns, following the conversions the WitcherScript compiler actually allows.

### Diagnostics scope

`witcherscript.diagnostics.scope` controls which files are diagnosed. It is live-switchable - change it and the Problems list updates.

| Value                 | Behaviour                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspace` (default) | Diagnose every `.ws` file in the project on startup. The Problems list shows diagnostics for all workspace files.                                                             |
| `openFiles`           | Diagnose only the files currently open. Symbols are still indexed project-wide so navigation and completion work everywhere, but the heavy whole-project checking is skipped. |
| `none`                | Suppress all diagnostics.                                                                                                                                                     |

## Completion

Completions are offered for members (after `.` and `:`), types, locals, `this`-shorthand members, globals, statement keywords, and modding-annotation parameters. Function and method completions expand to snippets with parameter placeholders.

Completions appear immediately as you type.

## Hover

Hover over a symbol for its type signature, annotations, and a file-line link to its declaration.

## Navigation

- **Go to Definition** - jump to a symbol's declaration, across files.
- **Go to Type Definition** - jump from a variable, field, or return type to its type's declaration. Generics target the constructor (`array<CFoo>` &rarr; `array`), enum members target their owning enum, and primitives produce no target.
- **Find References** - find every use of a symbol, workspace-wide.

## Rename

Rename a symbol across the whole workspace. Renames are rejected on read-only base game scripts.

## Signature help

Inside a call, parameter hints show the signature with active-parameter tracking as you move between arguments.

## Document Symbols

The outline shows nested classes, structs, enums, functions, methods, states, events, and fields for the current file.

## Semantic highlighting

Highlighting is driven by the server, so only valid variable and type names are coloured - mistakes stand out instead of being painted as if they resolved. Engine globals such as `thePlayer` and `theGame` highlight as variables with the `defaultLibrary` modifier; a workspace class of the same name still wins and highlights as a class.

## Code lenses

Two independent code lenses sit above declarations. Each is toggled separately.

### Overridden symbols

`witcherscript.codeLens.overriddenSymbols` (on by default) shows a **game definition** lens above each top-level symbol in a [legacy override script](/guide/script-directories#legacy-script-directories) that shadows a base game symbol. Clicking it runs **Go to Base Definition** and jumps to the original.

### Reference counts

`witcherscript.codeLens.references` (off by default) shows an **N references** lens above each top-level declaration and class method. Clicking it runs **Show References** and opens the references panel. You can turn this on from the [walkthrough](/guide/walkthrough) or settings:

```json
{
  "witcherscript.codeLens.references": true
}
```

## Witcher 3 modding awareness

The server understands the modding annotations:

- A method / field added with `@addMethod` / `@addField` becomes a real member of that class - it shows up in completion, hover, Go to Definition, and Find References everywhere the class is used, just like a built-in member.
- After `@wrapMethod(Class)` or `@replaceMethod`, the class's overridable methods are offered immediately, with `function` filled in for you.
- Inside a `@wrapMethod` body, Go to Definition, hover, and Find References on the special `wrappedMethod` call will go to the original, wrapped method.

## Synthetic / virtual built-ins

The built-in `array<T>` generic is available with the standard methods (`PushBack`, `PopBack`, `Insert`, `Erase`, `EraseFast`, `Clear`, `Size`, `Last`, `Contains`, `FindFirst`, `Grow`, `Remove`, `Resize`).

The language server understands arrays, `state` backing classes (e.g. `CR4PlayerStateExploration`), and a handful of classes never declared in base files OR shared imports. It keeps virtual definitions of them, allowing them to be used normally - including Go to Definition, which will open a read-only, auto-generated source file for you to see.
