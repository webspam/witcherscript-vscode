import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/witcherscript-vscode/',
  title: "WitcherScript",
  description: "WitcherScript language support, with code completion, diagnostics, and more.",
  cleanUrls: true,
  lastUpdated: true,
  // Raw head tags are not base-prefixed; include base manually.
  head: [['link', { rel: 'icon', href: '/witcherscript-vscode/logo.png' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Getting Started', link: '/getting-started' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/webspam/witcherscript-vscode' }
    ],

    editLink: {
      pattern: 'https://github.com/webspam/witcherscript-vscode/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 webspam'
    }
  }
})
