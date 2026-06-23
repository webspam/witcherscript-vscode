# Formatting

The extension includes an opinionated formatter. Use it through VS Code's standard **Format Document** (`Alt+Shift+F`) or enable **Format on Save**. There are a handful of preferences, set in VS Code's settings or a project `.wsformat.toml` file.

## Project config (`.wsformat.toml`) {#wsformat-toml}

Formatter preferences can also live in a `.wsformat.toml` file. The editor looks for one starting in the file's own directory and walking up through its ancestors, using the nearest match. A plain `wsformat.toml` is read too, but `.wsformat.toml` wins when both sit in the same directory.

Any settings in the file override VS Code.

| Key                    | Type                                  | Default    | Editor setting        |
| ---------------------- | ------------------------------------- | ---------- | --------------------- |
| `tab_size`             | int                                   | `4`        | -                     |
| `use_tabs`             | bool                                  | `false`    | -                     |
| `line_limit`           | int                                   | `100`      | `lineLimit`           |
| `colon_spacing`        | `spaced` \| `compact`                 | `spaced`   | `compactColon`        |
| `align_member_colons`  | bool                                  | `false`    | `alignMemberColons`   |
| `annotation_placement` | `preserve` \| `ownLine` \| `sameLine` | `preserve` | `annotationPlacement` |
| `default_placement`    | `preserve` \| `ownLine` \| `sameLine` | `preserve` | -                     |

```toml [wsformat.toml]
# .wsformat.toml
line_limit = 120
colon_spacing = "compact"
align_member_colons = true
```

:::info `wsformat` command-line formatter
The same `.wsformat.toml` also controls `wsformat`, a standalone CLI that formats files or whole directories from the terminal, with a `--check` mode that lists unformatted files for CI.

It can be downloaded from the [language server releases page](https://github.com/webspam/witcherscript-language/releases).
:::

## Line limit

`witcherscript.formatter.lineLimit` (default `100`) is the maximum line length the formatter targets before wrapping.

```json
{
  "witcherscript.formatter.lineLimit": 100
}
```

## Operator chains

Long operator chains such as `+` and `&&` keep the line breaks you wrote, so a deliberately wrapped boolean or arithmetic expression is not collapsed back onto one line.

## Compact colon

`witcherscript.formatter.compactColon` (default `false`) uses modern spacing for type annotations.

It also applies outside formatting: hovers and other tooltips, completion items, and inserted snippets all follow it.

::: code-group

```ws [compactColon: false]
var x : int;
```

```ws [compactColon: true]
var x: int;
```

:::

## Align member colons

`witcherscript.formatter.alignMemberColons` (default `false`) vertically aligns the colons of consecutive class, struct, and state field declarations into a column. A blank line, comment, or non-field member breaks a group.

Note: Will not format local `var` declarations in functions.

::: code-group

```ws [alignMemberColons: false]
var health : float;
var staminaRegen : float;
var name : string;
```

```ws [alignMemberColons: true]
var health       : float;
var staminaRegen : float;
var name         : string;
```

:::

## Annotation placement

`witcherscript.formatter.annotationPlacement` (default `preserve`) controls how `addField` annotations are placed relative to their member.

| Value      | Behaviour                                                      |
| ---------- | -------------------------------------------------------------- |
| `preserve` | Keep same-line vs split as written; normalise whitespace only. |
| `ownLine`  | Annotation always on the line above the member.                |
| `sameLine` | Annotation and member always on one line.                      |

::: code-group

```ws [ownLine]
@addField(CR4Player)
var customFlag : bool;
```

```ws [sameLine]
@addField(CR4Player) var customFlag : bool;
```

:::
