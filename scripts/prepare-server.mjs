import { spawnSync } from "child_process";
import fs from "fs";
import https from "https";
import path from "path";

const extensionRoot = path.resolve(import.meta.dirname, "..");
const executable = process.platform === "win32" ? "witcherscript-lsp.exe" : "witcherscript-lsp";
const bundledServerDir = path.join(extensionRoot, "server");
const bundledServer = path.join(bundledServerDir, executable);
const releaseRepo = "webspam/witcherscript-language";

loadLocalEnv();

const releaseTag = resolveReleaseTag();
const releaseApiUrl = `https://api.github.com/repos/${releaseRepo}/releases/tags/${encodeURIComponent(releaseTag)}`;

fs.mkdirSync(bundledServerDir, { recursive: true });

const localServerPath = process.env.WITCHERSCRIPT_LSP_PATH;

if (localServerPath) {
  const repoRoot = path.resolve(extensionRoot, localServerPath);
  if (!fs.existsSync(repoRoot) || !fs.statSync(repoRoot).isDirectory()) {
    throw new Error(`WITCHERSCRIPT_LSP_PATH is not a directory: ${repoRoot}`);
  }

  console.log(`Running \`just release\` in ${repoRoot}`);
  const build = spawnSync("just", ["release"], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: true,
  });
  if (build.status !== 0) {
    throw new Error(`\`just release\` failed in ${repoRoot} (exit ${build.status})`);
  }

  const sourcePath = path.join(repoRoot, "target", "release", executable);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Built binary not found: ${sourcePath}`);
  }

  fs.copyFileSync(sourcePath, bundledServer);
  makeExecutable(bundledServer);
  console.log(`Bundled ${bundledServer} from ${sourcePath}`);
} else {
  downloadReleaseServer()
    .then(() => {
      makeExecutable(bundledServer);
      console.log(`Bundled ${bundledServer} from ${releaseApiUrl}`);
    })
    .catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
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

function loadLocalEnv() {
  const envPath = path.join(extensionRoot, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function downloadReleaseServer() {
  const release = JSON.parse(
    await requestText(releaseApiUrl, {
      Accept: "application/vnd.github+json",
      "User-Agent": "witcherscript-vscode",
    }),
  );
  const asset = selectAsset(release.assets || []);
  if (!asset) {
    throw new Error(
      `No ${process.platform}/${process.arch} witcherscript-lsp release asset found at ${releaseApiUrl}`,
    );
  }

  const tmpZip = bundledServer + ".zip";
  await downloadFile(asset.browser_download_url, tmpZip);
  try {
    extractFromZip(tmpZip, bundledServer);
  } finally {
    fs.rmSync(tmpZip, { force: true });
  }
}

function selectAsset(assets) {
  const platformName = { win32: "windows", darwin: "macos", linux: "linux" }[process.platform] ?? process.platform;
  const archName = { x64: "x64", arm64: "arm64" }[process.arch] ?? process.arch;
  const expectedName = `witcherscript-language-${releaseTag}-${platformName}-${archName}.zip`;
  return assets.find(asset => asset.name === expectedName) ?? null;
}

function requestText(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, response => {
      if (isRedirect(response.statusCode)) {
        resolve(requestText(response.headers.location, headers));
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Request failed with ${response.statusCode}: ${url}`));
        return;
      }

      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => {
        body += chunk;
      });
      response.on("end", () => resolve(body));
    });
    request.on("error", reject);
  });
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    const request = https.get(
      url,
      { headers: { "User-Agent": "witcherscript-vscode" } },
      response => {
        if (isRedirect(response.statusCode)) {
          file.close();
          fs.rmSync(destination, { force: true });
          resolve(downloadFile(response.headers.location, destination));
          return;
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          file.close();
          fs.rmSync(destination, { force: true });
          reject(new Error(`Download failed with ${response.statusCode}: ${url}`));
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      },
    );
    request.on("error", error => {
      file.close();
      fs.rmSync(destination, { force: true });
      reject(error);
    });
  });
}

function extractFromZip(zipPath, destPath) {
  const tmpDir = zipPath + ".d";
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    if (process.platform === "win32") {
      const result = spawnSync(
        "powershell",
        ["-Command", `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tmpDir}' -Force`],
        { stdio: "inherit" },
      );
      if (result.status !== 0) throw new Error("Expand-Archive failed");
    } else {
      const result = spawnSync("unzip", ["-o", zipPath, "-d", tmpDir], { stdio: "inherit" });
      if (result.status !== 0) throw new Error(`unzip failed (exit ${result.status})`);
    }
    const extracted = path.join(tmpDir, path.basename(destPath));
    if (!fs.existsSync(extracted)) {
      throw new Error(`${path.basename(destPath)} not found in ${path.basename(zipPath)}`);
    }
    fs.copyFileSync(extracted, destPath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function isRedirect(statusCode) {
  return statusCode >= 300 && statusCode < 400;
}

function makeExecutable(filePath) {
  if (process.platform !== "win32") {
    fs.chmodSync(filePath, 0o755);
  }
}
