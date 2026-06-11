# Code Style

## Functions

Extract named functions over anonymous closures. Not applicable to simple event callbacks.
A function should do one thing; if it needs a comment to explain what it does, it needs a better name or a split.
Prefer self-describing names (`connectToTcpServer`, `handleTcpConnectionError`) over generic ones (`handler`, `fn`, `helper`).

## Loops over chained array methods

Prefer an explicit `for...of` loop to chained array methods (`.filter`, `.map`, `.reduce`). Not for performance - for readability: one loop states the intent once, in order. Reach for an array method only for a single, simple transformation with a short pure callback; once the callback grows a body or accumulates state, write the loop.

## Early returns must not hide bugs

An early return is for a case that is genuinely expected and correctly needs no action. It is not a place for the silent discard of error state. Before a guard returns, decide which you have: if the condition should never happen, make it observable - log it or throw - *then* return. Silently discarding error state erases the difference between "correctly did nothing" and "bailed because something was broken."

## Comments

**Any comments MUST be terse AND concise - less is more, minimal.**

**ONLY** write a comment when the **why** is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific behaviour. Never describe what the code does - well-named identifiers already do that.

## Logging

`trace` - diagnostic detail for debugging specific flows (e.g. recovery dialog choices, connection attempts).
`debug` - developer-relevant events during normal dev work.
`info` and above - visible in production; use sparingly.

## TypeScript

- Always use return type annotations.
- NEVER use `void` on Promises; prefixing any statement with `void` is a rule violation.

## Principles

- Guard clauses / early returns over nested `if`
- Explicit over implicit - truthiness coercion only after exhaustively considering all possible outcomes, prefer `=== undefined`
- `readonly` and `const` by default; mutate deliberately
- Narrow types - discriminated unions over optional-field soup
- No `any`; `unknown` at boundaries, then narrow
- Exhaustive `switch` with `never` default check
- Validate external input at the boundary, trust it inward
- Name magic values as `const`
- Errors fail loud - no silent `catch {}`
- Small files, one responsibility each
- No clever one-liners - clarity beats brevity

## General

No premature abstractions - three similar lines beats an abstraction that doesn't yet earn its keep. No backwards-compatibility shims, `_unused` renames, or `// removed` comments for deleted code. Don't design for hypothetical future requirements unless explicitly instructed to.
