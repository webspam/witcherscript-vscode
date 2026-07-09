# Code Style

## Functions

- A function should do one thing; if it needs a comment to explain what it does, it likely needs a better name or a split
- Prefer self-describing names (`draftPullRequest`, `handleTcpConnectionError`) over generic (`handler`, `fn`, `helper`)
- Prefer named functions over anonymous closures, unless:
  - Tiny & cheap
  - It *degrades* legibility (e.g. requires complex type plumbing)

### Early returns must not hide bugs

Silently discarding error state erases the difference between "correctly did nothing" and "aborted because something was broken".

If the condition should never happen, make it observable - throw, or log it *then* return.

## Loops over chained array methods

Prefer an explicit `for...of` loop over chained array methods (`.filter`, `.map`, `.reduce`).

Use array methods only for a small, simple transformation with a short pure callback.

## Comments

- **ONLY** write a comment when the **why** is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific behaviour
- **Any comments MUST be minimal: terse, concise, plain English sentence**
- Never describe what the code does - well-named identifiers already do that

## Types

- Always use return type annotations
- Never use `void` on Promises

## Principles

1. Narrow types using modern TS coding standards - do NOT use type assertions (`as`)
   - Non-inferred type guards (explicit return `x is T`) are assertions

- Guard clauses / early returns over nested `if`
- Explicit over implicit
  - Truthiness coercion only when intentionally discarding all falsy possibilities
- `readonly` and `const` by default
- Narrow types - discriminated unions over optional-field soup
- No `any`; `unknown` at boundaries, then narrow
- Exhaustive `switch` with `never` default check
- Validate external input at the boundary, trust it inward
- Name magic values as `const`
- Errors fail loud - no silent `catch {}`
- Small files, one responsibility each
- No clever one-liners - clarity beats brevity
