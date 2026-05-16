# Code Style

## Functions

Extract named functions over anonymous closures. A function should do one thing;
if it needs a comment to explain what it does, it needs a better name or a split.
Prefer self-describing names (`connectToTcpServer`, `handleTcpConnectionError`) over
generic ones (`handler`, `fn`, `helper`).

## Comments

Only write a comment when the **why** is non-obvious: a hidden constraint, a subtle
invariant, a workaround for a specific behaviour. Never describe what the code does —
well-named identifiers already do that. Be concise; no multi-line comment blocks
or verbose docstrings.

## Logging

`trace` — diagnostic detail for debugging specific flows (e.g. recovery dialog
choices, connection attempts).  
`debug` — developer-relevant events during normal dev work.  
`info` and above — visible in production; use sparingly.

## TypeScript

- Always use return type annotations.
- NEVER use `void` on Promises; prefixing any statement with `void` is a rule violation.

## General

No premature abstractions — three similar lines beats an abstraction that doesn't yet
earn its keep. No backwards-compatibility shims, `_unused` renames, or `// removed`
comments for deleted code. Don't design for hypothetical future requirements unless
explicitly instructed to.
