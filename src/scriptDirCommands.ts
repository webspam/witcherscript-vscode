import * as vscode from "vscode";
import { commands, configs, type ConfigItem } from "./generated-meta";

/**
 * Each command takes an optional directory. With one (server code action) it's added
 * directly; without one (settings UI link) a folder picker opens.
 */
export function registerScriptDirCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(commands.addLegacyScriptDirectory, (directory?: string) =>
      addScriptDirectory(configs.legacyScriptDirectories, directory),
    ),
    vscode.commands.registerCommand(commands.addAdditionalScriptDirectory, (directory?: string) =>
      addScriptDirectory(configs.additionalScriptDirectories, directory),
    ),
  );
}

type ScriptConfigKeys =
  | typeof configs.legacyScriptDirectories.key
  | typeof configs.additionalScriptDirectories.key;

async function addScriptDirectory(
  setting: ConfigItem<ScriptConfigKeys>,
  directory: string | undefined,
): Promise<void> {
  if (!vscode.workspace.workspaceFolders?.length) {
    await vscode.window.showErrorMessage(
      "Open a folder or workspace first — script directories are stored in workspace settings.",
    );
    return;
  }

  const picked =
    typeof directory === "string" && directory.length > 0 ? [directory] : await pickFolders();
  if (picked.length === 0) return;

  const config = vscode.workspace.getConfiguration();
  const current = config.get(setting.key, setting.default);
  const toAdd: string[] = [];
  for (const dir of picked) {
    if (!current.includes(dir) && !toAdd.includes(dir)) toAdd.push(dir);
  }
  if (toAdd.length === 0) {
    await vscode.window.showInformationMessage(
      picked.length === 1
        ? `"${picked[0]}" is already in ${setting.key}.`
        : `All selected folders are already in ${setting.key}.`,
    );
    return;
  }

  await config.update(setting.key, [...current, ...toAdd], vscode.ConfigurationTarget.Workspace);
}

async function pickFolders(): Promise<string[]> {
  const selected = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: true,
    openLabel: "Add",
    title: "Add script directory",
  });
  return selected?.map(uri => uri.fsPath) ?? [];
}
