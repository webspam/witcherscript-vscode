## Creating a Release

### Via GitHub Actions

1. Bump `version` in `package.json` on `master` and commit.
2. Run the "Create Extension Release" workflow from the Actions tab:
   - **Title** (optional, defaults to the tag — `v<package.json version>`).
   - **Summary** (optional; markdown, appears above auto-generated notes).
   - **Pre-release** — defaults to true.
3. The workflow produces a **draft** release tagged `v<version>` with the `.vsix` attached and GitHub's auto-generated notes. Review and publish manually from the Releases page.

The `.vsix` is named `witcherscript-language-features-win32-x64-<version>.vsix` and bundles the Windows `witcherscript-lsp.exe` from the latest release of `webspam/witcherscript-language`. The `win32-x64` target tells the VS Code marketplace this build is Windows-only, so installs are correctly filtered on other platforms.

## Create Release Process

High-level overview of what the workflow does. For actual steps, see the workflow file.

1. **Checkout** — clean checkout of the source.
2. **Derive tag** — read `version` from `package.json` and use `v<version>` as the release tag, so the tag and the `.vsix` filename always agree.
3. **Install** — restore Node dependencies for the extension build.
4. **Check** — typecheck and lint the extension sources so a broken build never produces a release.
5. **Bundle LSP** — fetch the matching `witcherscript-lsp` binary from the latest release of the language-server repo and stage it under `server/`.
6. **Package** — compile the extension and run `vsce package` to produce a single `.vsix` containing the compiled extension plus the bundled server binary.
7. **Draft release** — create a GitHub draft release at the derived tag, attach the `.vsix`, and populate notes from GitHub's auto-generator (with an optional summary prepended).

### Build requirements

- A GitHub-hosted Windows runner (Node 20+, PowerShell, `gh` CLI).
- `GITHUB_TOKEN` with `contents: write` (the workflow declares this).
- The `witcherscript-lsp` repo (`webspam/witcherscript-language`) must have a published release with platform-matching assets; the build step downloads from `/releases/latest`.
