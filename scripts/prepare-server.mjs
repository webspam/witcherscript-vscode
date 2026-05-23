import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const extensionRoot = path.resolve(import.meta.dirname, "..");
const executable = process.platform === "win32" ? "witcherscript-lsp.exe" : "witcherscript-lsp";
const bundledServerDir = path.join(extensionRoot, "server");
const bundledServer = path.join(bundledServerDir, executable);
const releaseRepo = "webspam/witcherscript-language";

loadDotEnv();
fs.mkdirSync(bundledServerDir, { recursive: true });

const localBuildPath = process.env.WITCHERSCRIPT_LSP_PATH;
if (localBuildPath) {
  bundleFromLocalBuild(localBuildPath);
} else {
  await bundleFromRelease(resolveReleaseTag());
}

function bundleFromLocalBuild(lspPath) {
  const repoRoot = path.resolve(extensionRoot, lspPath);
  if (!fs.existsSync(repoRoot) || !fs.statSync(repoRoot).isDirectory()) {
    throw new Error(`WITCHERSCRIPT_LSP_PATH is not a directory: ${repoRoot}`);
  }

  console.log(`Running \`just release\` in ${repoRoot}`);
  const build = spawnSync("just", ["release"], { cwd: repoRoot, stdio: "inherit", shell: true });
  if (build.status !== 0) {
    throw new Error(`\`just release\` failed in ${repoRoot} (exit ${build.status})`);
  }

  const builtBinary = path.join(repoRoot, "target", "release", executable);
  if (!fs.existsSync(builtBinary)) {
    throw new Error(`Built binary not found: ${builtBinary}`);
  }

  fs.copyFileSync(builtBinary, bundledServer);
  makeExecutable(bundledServer);
  console.log(`Bundled ${bundledServer} from ${builtBinary}`);
}

async function bundleFromRelease(releaseTag) {
  const releaseApiUrl = `https://api.github.com/repos/${releaseRepo}/releases/tags/${encodeURIComponent(releaseTag)}`;
  const release = await fetchJson(releaseApiUrl);
  const asset = findPlatformAsset(release.assets ?? [], releaseTag);
  if (!asset) {
    throw new Error(`No ${process.platform}/${process.arch} asset for ${releaseTag} at ${releaseApiUrl}`);
  }

  const tmpZip = `${bundledServer}.zip`;
  await downloadToFile(asset.browser_download_url, tmpZip);
  try {
    extractMember(tmpZip, executable, bundledServerDir);
  } finally {
    fs.rmSync(tmpZip, { force: true });
  }
  makeExecutable(bundledServer);
  console.log(`Bundled ${bundledServer} from ${releaseApiUrl}`);
}

function findPlatformAsset(assets, releaseTag) {
  const platformName = { win32: "windows", darwin: "macos", linux: "linux" }[process.platform];
  if (!platformName) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  const expectedName = `witcherscript-language-${releaseTag}-${platformName}-${process.arch}.zip`;
  return assets.find(asset => asset.name === expectedName);
}

function resolveReleaseTag() {
  const override = process.env.WITCHERSCRIPT_LSP_VERSION?.trim();
  if (override) return override;

  const pkg = JSON.parse(fs.readFileSync(path.join(extensionRoot, "package.json"), "utf8"));
  const pinned = pkg.witcherscriptLsp?.version;
  if (!pinned) {
    throw new Error(
      "No LSP version pinned: set `witcherscriptLsp.version` in package.json or WITCHERSCRIPT_LSP_VERSION",
    );
  }
  return pinned;
}

function loadDotEnv() {
  const envPath = path.join(extensionRoot, ".env");
  if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "witcherscript-vscode",
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${url}`);
  }
  return response.json();
}

async function downloadToFile(url, destination) {
  const response = await fetch(url, { headers: { "User-Agent": "witcherscript-vscode" } });
  if (!response.ok) {
    throw new Error(`Download failed with ${response.status}: ${url}`);
  }
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

// `tar` reads .zip via libarchive on Windows 10 1803+, macOS, and Linux, so one call covers every platform.
function extractMember(zipPath, memberName, destinationDir) {
  const result = spawnSync("tar", ["-xf", zipPath, "-C", destinationDir, memberName], { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Failed to extract ${memberName} from ${zipPath} (exit ${result.status})`);
  }
  if (!fs.existsSync(path.join(destinationDir, memberName))) {
    throw new Error(`${memberName} not found in ${path.basename(zipPath)}`);
  }
}

function makeExecutable(filePath) {
  if (process.platform !== "win32") {
    fs.chmodSync(filePath, 0o755);
  }
}
