---
layout: home

hero:
  name: WitcherScript
  text: Language support for The Witcher 3 script files
  tagline: Code completion, diagnostics, and more in VS Code and Cursor, powered by a bundled Rust language server.
  image:
    src: /logo.png
    alt: WitcherScript
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: Language Features
      link: /guide/language-features
    - theme: alt
      text: View on Marketplace
      link: https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript

features:
  - title: Diagnostics
    details: Syntax errors and type-checking warnings as you type, scoped to the whole project or just open files.
    link: /guide/language-features
    linkText: Learn more
  - title: Unused symbols
    details: Locals, parameters, and private fields that are never used are dimmed in the editor.
    link: /guide/language-features#unused-symbols
  - title: Completion
    details: Members, types, locals, and globals - method completions expand to snippets with parameter placeholders.
    link: /guide/language-features#completion
  - title: Hover
    details: Type signatures, annotations, and file-line links.
    link: /guide/language-features#hover
  - title: Navigation
    details: Go to Definition, Go to Type Definition, workspace-wide Find References, and workspace symbol search.
    link: /guide/language-features#navigation
  - title: Rename
    details: Workspace-wide symbol renaming, rejected on read-only base game scripts.
    link: /guide/language-features#rename
  - title: Signature help
    details: Parameter hints with active-parameter tracking inside calls.
    link: /guide/language-features#signature-help
  - title: Inlay hints
    details: Parameter-name hints at call sites show which argument fills which parameter, with out params marked.
    link: /guide/language-features#inlay-hints
  - title: Document Symbols
    details: An outline of classes, structs, enums, functions, methods, states, events, and fields.
    link: /guide/language-features#document-symbols
  - title: Semantic highlighting
    details: Only highlights valid variable and type names, so mistakes stand out.
    link: /guide/language-features#semantic-highlighting
  - title: Document formatting
    details: An opinionated pretty-printer with a configurable line limit, colon style, and alignment.
    link: /guide/formatting
  - title: Code lenses
    details: Game-definition links on overridden symbols and reference counts on declarations.
    link: /guide/language-features#code-lenses
  - title: Code actions
    details: Extract a variable, function, or method, and collapse or expand switch and if / else.
    link: /guide/language-features#code-actions
  - title: Shared Imports auto-load
    details: Automatically uses modSharedImports and the missing classes / imports it provides
    link: /guide/game-directory#shared-imports
  - title: Auto-detected projects
    details: Folders with a witcherscript.toml manifest are indexed automatically, no config needed.
    link: /guide/getting-started
---
