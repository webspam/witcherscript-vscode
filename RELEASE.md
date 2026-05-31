## Creating a Release

The supported path is the `/create-release` command (`.claude/commands/create-release.md`): it bumps the version, pins the bundled LSP, writes the user-focused `CHANGELOG.md` entry, opens and merges the bump PR, then triggers the workflow below. The manual path is documented here as a fallback.

### Via GitHub Actions

1. Bump `version` in `package.json`.
2. Regenerate `src/generated-meta.ts` with `npm run gen:meta`.
3. Add a `## <version>` section at the top of `CHANGELOG.md`.
4. Commit to `master`.
5. Run the "Create Extension Release" workflow from the Actions tab:
   - **Title** (optional, defaults to the tag - `v<package.json version>`).
   - **Pre-release** - defaults to false (stable). When true, the Marketplace upload is also flagged as a pre-release.
   - **Publish to VS Code Marketplace** - defaults to false (draft GitHub release only). Check it to also publish to the Marketplace.
6. The workflow produces a **draft** release tagged `v<version>` with the `.vsix` attached. The notes are the `## <version>` section of `CHANGELOG.md` (it MUST exist, or the workflow fails), followed by GitHub's auto-generated PR list. Review and publish the GitHub release manually from the Releases page. The Marketplace upload happens automatically in a separate step and goes live as soon as the Marketplace finishes scanning the package.

The `.vsix` is named `witcherscript-win32-x64-<version>.vsix` and bundles the Windows `witcherscript-lsp.exe` from the latest release of `webspam/witcherscript-language`. The `win32-x64` target tells the VS Code marketplace this build is Windows-only, so installs are correctly filtered on other platforms.

## Create Release Process

High-level overview of what the workflow does. For actual steps, see the workflow file.

1. **Checkout** — clean checkout of the source.
2. **Derive tag** — read `version` from `package.json` and use `v<version>` as the release tag, so the tag and the `.vsix` filename always agree.
3. **Install** — restore Node dependencies for the extension build.
4. **Check** — typecheck the extension sources so a broken build never produces a release.
5. **Bundle LSP** — fetch the matching `witcherscript-lsp` binary from the latest release of the language-server repo and stage it under `server/`.
6. **Package** — bundle the extension with esbuild and run `vsce package` to produce a single `.vsix` containing the bundled extension plus the language-server binary.
7. **Draft release** — create a GitHub draft release at the derived tag, attach the `.vsix`, and populate notes from GitHub's auto-generator (with an optional summary prepended).
8. **Publish to Marketplace** — call `vsce publish --packagePath <vsix> --target win32-x64` against the same `.vsix`. Skipped when `publish_marketplace` is unchecked; passes `--pre-release` when the release is flagged as a pre-release.

### Build requirements

- A GitHub-hosted Windows runner (Node 24, PowerShell, `gh` CLI).
- `GITHUB_TOKEN` with `contents: write` (the workflow declares this).
- `VSCE_PAT` repo secret — a Marketplace personal access token under publisher `webspam`. See "One-time setup" below.
- The `witcherscript-lsp` repo (`webspam/witcherscript-language`) must have a published release with platform-matching assets; the build step downloads from `/releases/latest`.

## One-time setup

To enable the Marketplace publish step, create a Marketplace PAT and store it as a repo secret:

1. Sign in at https://dev.azure.com under any organization with the same Microsoft account that owns the `webspam` Marketplace publisher.
2. Open **User Settings → Personal Access Tokens → New Token**.
   - **Organization**: All accessible organizations.
   - **Expiration**: pick something reasonable (1 year is the max).
   - **Scopes**: switch to *Custom defined*, then check **Marketplace → Manage**.
3. Copy the token.
4. In GitHub, go to repo **Settings → Secrets and variables → Actions → New repository secret** and add `VSCE_PAT` with the token value.

The first publish only — verify the listing renders correctly on https://marketplace.visualstudio.com/items?itemName=webspam.witcherscript. To roll back a bad release, run `npx @vscode/vsce unpublish webspam.witcherscript@<version>` locally.
