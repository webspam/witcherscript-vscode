import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as vscode from "vscode";
import { configs, type ConfigKeyTypeMap } from "./generated-meta";

/**
 * The `content/` check catches the common mistake of picking a mod folder
 * or the install's parent. Global scope because the install path is
 * per-machine, not per-workspace.
 */
export async function setGameDirectory(restart: () => Promise<void>): Promise<void> {
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Select Witcher 3 Folder",
    title: "Select your Witcher 3 game directory",
  });
  if (!picked || picked.length === 0) return;

  const dir = picked[0].fsPath;
  if (!fs.existsSync(path.join(dir, "content"))) {
    const useAnyway = "Use Anyway";
    const choice = await vscode.window.showWarningMessage(
      `"${dir}" does not look like a Witcher 3 install (no content folder). Use it anyway?`,
      useAnyway,
    );
    if (choice !== useAnyway) return;
  }

  await vscode.workspace
    .getConfiguration()
    .update(configs.gameDirectory.key, dir, vscode.ConfigurationTarget.Global);

  await restart();
  vscode.window.showInformationMessage(
    "WitcherScript: game directory set. Language server restarted.",
  );
}

/**
 * Drives walkthrough step visibility — `when` clauses in package.json gate
 * the "detected" vs "set me up" steps on this key, so auto-detected installs
 * don't make the user read setup instructions they don't need.
 */
export function registerGameDirectoryContextKey(
  context: vscode.ExtensionContext,
  initialGameDirectory: string,
): void {
  const apply = (gameDirectory: string): void => {
    void vscode.commands.executeCommand(
      "setContext",
      "witcherscript.gameDirectoryResolved",
      !!gameDirectory,
    );
  };

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(configs.gameDirectory.key)) {
        apply(resolveGameDirectory());
      }
    }),
  );

  apply(initialGameDirectory);
}

/**
 * Pass `outputChannel` only from the single startup call to log how the
 * directory was resolved; omit it elsewhere to avoid duplicate logs and
 * noise on config changes. Returns "" (not undefined) so callers can forward
 * straight into LSP options — the server treats empty as "not configured".
 */
export function resolveGameDirectory(outputChannel?: vscode.LogOutputChannel): string {
  const { key } = configs.gameDirectory;
  const configured = vscode.workspace.getConfiguration().get<ConfigKeyTypeMap[typeof key]>(key);
  if (configured) return configured;

  if (process.platform !== "win32") return "";

  const detected = detectGogGameDirectory();
  if (!detected) return "";

  if (!fs.existsSync(detected)) {
    outputChannel?.appendLine(
      `Registry (GOG) lists game directory "${detected}", but it does not exist. Set witcherscript.gameDirectory manually.`,
    );
    return "";
  }

  outputChannel?.info(
    `witcherscript.gameDirectory is not set; using GOG installation path from registry: ${detected}`,
  );
  return detected;
}

/**
 * `1495134320` is GOG's stable product ID for Witcher 3. Shelling out to
 * `reg` avoids a native-module dep for a single boot-time read.
 */
function detectGogGameDirectory(): string {
  const key = "HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1495134320";
  try {
    const output = execSync(`reg query "${key}" /v path`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const match = output.match(/^\s*path\s+REG_SZ\s+(.+?)\s*$/m);
    return match ? match[1] : "";
  } catch {
    return "";
  }
}
