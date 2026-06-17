# Formatting

The extension includes an opinionated formatter. Use it through VS Code's standard **Format Document** (`Alt+Shift+F`) or enable **Format on Save**. There are a handful of preferences that can be set.

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
