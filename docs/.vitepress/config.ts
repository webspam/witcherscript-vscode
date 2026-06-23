import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { codiconPlugin } from "./codicon-plugin";

// Highlight `.ws` snippets with the extension's own TextMate grammar.
const grammarPath = fileURLToPath(
  new URL("../../syntaxes/witcherscript.tmLanguage.json", import.meta.url),
);
const witcherscriptGrammar = {
  ...JSON.parse(readFileSync(grammarPath, "utf8")),
  name: "witcherscript",
  aliases: ["ws"],
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/witcherscript-vscode/",
  title: "WitcherScript",
  description: "WitcherScript language support, with code completion, diagnostics, and more.",
  cleanUrls: true,
  lastUpdated: true,
  // Raw head tags are not base-prefixed; include base manually.
  head: [["link", { rel: "icon", href: "/witcherscript-vscode/logo.png" }]],
  markdown: {
    languages: [witcherscriptGrammar],
    config: (md) => { md.use(codiconPlugin); },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Reference", link: "/reference/settings", activeMatch: "/reference/" },
      { text: "Changelog", link: "/changelog" },
      {
        text: "View on VS Code",
        link: "https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript",
      },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Walkthrough", link: "/guide/walkthrough" },
          { text: "Game Directory", link: "/guide/game-directory" },
          { text: "Script Directories", link: "/guide/script-directories" },
          { text: "Language Features", link: "/guide/language-features" },
          { text: "Formatting", link: "/guide/formatting" },
          { text: "Status Bar", link: "/guide/status-bar" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Settings", link: "/reference/settings" },
          { text: "Commands", link: "/reference/commands" },
          { text: "Changelog", link: "/changelog" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/webspam/witcherscript-vscode" }],

    editLink: {
      pattern: "https://github.com/webspam/witcherscript-vscode/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright (c) 2026 webspam",
    },
  },
});
