---
name: vitepress-docs
description: Anything touching this repo's VitePress docs site - editing `.md` pages, `.vitepress/config`, sidebar/nav, theme, search, dynamic routes, data loaders, or the docs build/deploy. Covers VitePress architecture, conventions, and the full config/theming surface so a fresh agent acts without re-reading the upstream docs.
---

# VitePress (v2.0.0-alpha.17)

Static site generator: Markdown source -> theme -> static HTML. Built on **Vite + Vue 3**. Node **>=20**. **ESM-only** package (no `require`; config files need `"type":"module"` or `.mjs`/`.mts`).

**Runtime model**: ships pre-rendered HTML, then hydrates into a Vue **SPA**. Every `.md` page compiles to a Vue SFC, so any Vue feature works inline. All theme/page code **must be SSR-compatible** (build pre-renders in Node).

## Project layout

```
docs/                      # project root of the VitePress site
  .vitepress/
    config.{js,ts,mjs,mts} # site + theme config (reserved dir)
    cache/  dist/          # dev cache + build output (gitignore both)
    theme/index.{js,ts}    # optional custom/extended theme entry
  public/                  # static assets served as-is from output root
  index.md  *.md           # source files
```

- **Project root** = dir containing `.vitepress/`. **Source dir** = where `.md` live (default = root; override with `srcDir`).
- CLI: `vitepress dev|build|preview [root]`, `vitepress init` (scaffold wizard). Dev server :5173, preview :4173.
- Config: default-export an object (or async function for dynamic). `defineConfig` for intellisense; `defineConfigWithTheme<ThemeConfig>` for custom theme types. Top-level keys = site options; `themeConfig` = theme options. Vite/Vue/markdown-it configured inline via `vite`/`vue`/`markdown` keys (no separate Vite config).

## Routing

File-based: `index.md`->`/`, `foo.md`->`/foo.html`, `guide/index.md`->`/guide/`.
- **Links**: omit extension (`[x](./getting-started)`); `base` auto-prepended to rooted links.
- **`cleanUrls`** (config opt-in): emit extensionless URLs. Relies on host serving `/foo` as `/foo.html` - default on Netlify/GH Pages, needs `vercel.json` on Vercel; no server support -> use `foo/index.md` instead.
- **`rewrites`**: map source path -> output path (object, `:param` dynamic, or function). Relative links must then be based on rewritten paths.
- **Dynamic routes**: `[param].md` template + sibling `[param].paths.js` default-exporting `{ paths() }` returning `[{ params, content? }]`. Runs in Node at build time. `watch` globs trigger HMR. Access via `{{ $params.x }}` or `useData().params`. Heavy/raw content -> `content` field + `<!-- @content -->` in template (don't bloat serialized params). `defineRoutes` for types.

## Frontmatter

YAML (or JSON) at very top of `.md`, parsed by gray-matter. Access: `{{ $frontmatter.x }}` or `useData().frontmatter`. Overrides site/theme config per-page.
- Universal: `title`, `titleTemplate`, `description`, `head` (appended).
- Default-theme: `layout` (`doc`|`home`|`page`, default `doc`; also `false`=bare, or a global component name), `hero`/`features` (home), `navbar`/`sidebar`/`editLink`/`footer` (bool toggles), `aside`/`outline`/`lastUpdated` (same value types as their `themeConfig` keys, e.g. `aside: 'left'`), `pageClass`, `prev`/`next`, `search: false` (exclude from local index).

## Markdown extensions (markdown-it + Shiki)

- **Anchors**: auto on headers; custom `# H {#anchor}`. **TOC**: `[[toc]]`. **Tables**, **emoji** `:tada:`.
- **Containers**: `::: info|tip|warning|danger|details ... :::` (custom title `::: danger STOP`); `::: raw` (wraps `vp-raw` to dodge style/router conflicts); GitHub alerts `> [!NOTE]`.
- **Code blocks**: lang after backticks; line highlight ` ```js{1,4-8} ` or `// [!code highlight]`; also `focus`, `--`/`++` diff, `error`/`warning` markers; `markdown.lineNumbers` or per-block `:line-numbers`.
- **Import snippets**: `<<< @/path.js{2}` (`@`=source root; supports VS Code `#region`, lang in braces).
- **Code groups**: `::: code-group` with `` ```js [label] `` blocks.
- **File include**: `<!--@include: ./parts/x.md{1,10}-->` (line range / `#region` / `#header-anchor`; missing file does NOT throw - verify output).
- **Math** (opt-in): install `markdown-it-mathjax3`, set `markdown.math: true`.
- Extend markdown-it: `markdown.config: (md) => md.use(plugin)`.

## Vue in Markdown

- Interpolation `{{ }}`, directives, components all work. Root-level `<script setup>` / `<style module>` (place after frontmatter; **avoid `<style scoped>`** - use `$style`).
- Components: import locally (code-split) or register globally via `enhanceApp`. **Name must be hyphenated or PascalCase** else wrapped in `<p>` -> hydration mismatch.
- Escape: `v-pre` / `::: v-pre`; code fences auto-`v-pre` (enable interpolation with `-vue` lang suffix).
- CSS preprocessors built-in (install `sass`/`less`/`stylus`). Teleports: body only, else `<ClientOnly>` / `postRender`.

## Data loading (build-time)

- **`*.data.js`**: default-export `{ load() }` (Node-only, async ok); import via the **`data` named export**. `watch` globs -> `load(absolutePaths)` + HMR. Heavy parse deps stay server-side.
- **`createContentLoader('glob', opts)`** from `vitepress`: archive/index pages. Returns `ContentData[]` (`url`, `frontmatter`, optional `src`/`html`/`excerpt`). Opts: `includeSrc`, `render`, `excerpt`, `transform`. Usable inside `buildEnd` (e.g. RSS). `defineLoader` for types.
- **CMS** = dynamic routes + `loadEnv` for tokens in the `.paths.js`.

## SSR compatibility

Access browser/DOM only in `mounted`/`beforeMount`. For libs that touch `window` on import: dynamic `import()` in `onMounted`, gate with `import.meta.env.SSR`, or `defineClientComponent(() => import(...))`. Wrap non-SSR components in `<ClientOnly>`.

## Theming

**Default theme** is the docs theme. Three escalating customization levels:
1. **`themeConfig`** options (below).
2. **CSS vars**: `import 'vitepress/theme'` + custom CSS overriding `--vp-c-brand-1` etc (full list in `theme-default/styles/vars.css`). Fonts: default Inter bundled; use `vitepress/theme-without-fonts` to swap.
3. **Extend**: custom theme `{ extends: DefaultTheme, enhanceApp({app,router,siteData}) {} }`. Register global components in `enhanceApp`. Inject content via **layout slots** (e.g. `doc-before`, `aside-outline-before`, `home-hero-after`, `nav-bar-content-after`, `layout-bottom`) by wrapping `DefaultTheme.Layout`. Override internal components via Vite `resolve.alias` (names are internal, may change).

**Custom theme** (full replacement): `.vitepress/theme/index.js` default-exports `{ Layout (required), enhanceApp?, extends? }`. `Layout` must contain `<Content />`. Distributable as npm package (export `ThemeConfig` type, optional `pkg/config` sub-path).

### Default `themeConfig` surface
- **Nav/branding**: `logo`, `siteTitle`, `nav` (`NavItem[]`; links, `fn(PageData)`, dropdowns via `items`, `activeMatch` regex string, custom `component`), `socialLinks` (simple-icons name or SVG).
- **Sidebar**: `SidebarItem[]` or `SidebarMulti` (path-keyed `{'/guide/':[...]}` for per-section sidebars). Nest up to 6 levels. `collapsed`: omit = not collapsible (no toggle), `true` = collapsible+closed, `false` = collapsible+open. `base` for shared prefixes.
- **Content layout**: `aside` (`true`/`'left'`/`false`), `outline` (`level`/`[n,n]`/`'deep'`/`false`), `docFooter` (prev/next labels).
- **Footer/edit/updated**: `footer` (`{message,copyright}`; only shows when NO sidebar), `editLink` (`{pattern:'...:path',text}`), `lastUpdated` (`{text,formatOptions}`).
- **Search**: `search.provider: 'local'` (minisearch in-browser, fuzzy; `options.miniSearch`, i18n via `options.locales`, custom `_render` or `search:false` to exclude). Community: pagefind/orama/typesense.
- **a11y/i18n labels**, `externalLinkIcon`, `i18nRouting`.
- Composables (from `vitepress/theme`): `useLayout()`. Global components: `<Badge type text>`.

### Home page (`layout: home`)
`hero` (`{name,text,tagline,image,actions:[{theme,text,link}]}`) + `features` (`[{icon,title,details,link}]`). Markdown below frontmatter is appended and auto-styled.

## i18n

`locales` map: `root` (top-level dir) + locale subdirs (`fr/`). Each `LocaleSpecificConfig` overrides `lang`/`dir`/`title`/`description`/`head` (merged) /`themeConfig` (shallow-merged). VitePress won't auto-redirect `/`->`/en/` for all-subdir setups - configure the server. RTL: `dir:'rtl'` + RTLCSS plugin (experimental).

## Build hooks (config-level)

`buildEnd(siteConfig)`, `postRender(ctx)` (teleports), `transformHead(ctx)->HeadConfig[]` (build-only, expensive head gen like og:image), `transformHtml(code,id,ctx)`, `transformPageData(pageData,{siteConfig})` (runs in dev + client nav too; push to `pageData.frontmatter.head` for canonical/og tags). Don't mutate ctx in transform*. Sitemap: `sitemap: {hostname}` (+ `transformItems`; needs `lastUpdated` for `<lastmod>`).

## Assets

Reference via relative URLs (`![](./img.png)`) -> hashed, copied if referenced; <4kb inlined. `public/` -> copied as-is, reference with root-absolute path (`public/icon.png` -> `/icon.png`). Non-image docs (PDFs) go in `public/`. Dynamic asset paths in theme: wrap with `withBase()`.

## Runtime API (import from `vitepress`)

- `useData()` -> refs: `site`, `theme`, `page` (PageData), `frontmatter`, `params`, `title`, `description`, `lang`, `isDark`, `dir`, `localeIndex`, `hash`.
- `useRoute()`, `useRouter()` (`go()`, `onBefore/AfterRouteChange`, `onBefore/AfterPageLoad`).
- `withBase(path)`. Components `<Content />`, `<ClientOnly />`. Globals `$frontmatter`, `$params`.

## Deploy

Build `npm run docs:build` -> output `docs/.vitepress/dist` (Node >=20). Sub-path deploy: set `base: '/repo/'` (must start+end with slash). Content-hashed assets under `/assets/` -> cache `max-age=31536000,immutable`. **Don't enable HTML auto-minify** (strips Vue-meaningful comments -> hydration mismatch). `lastUpdated` needs full git history (`fetch-depth: 0`). Nginx: `try_files $uri $uri.html $uri/ =404;`, must NOT fall back to index.html. Platforms: GH/GitLab/Netlify/Vercel/Cloudflare Pages, Azure SWA, Firebase, etc.
