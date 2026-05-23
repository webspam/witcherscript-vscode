import * as vscode from "vscode";

const ADD_LEGACY_DIR_COMMAND = "witcherscript.addLegacyScriptDirectory";
const ADD_ADDITIONAL_DIR_COMMAND = "witcherscript.addAdditionalScriptDirectory";

/**
 * Each command takes an optional directory. With one (server code action) it's added
 * directly; without one (settings UI link) a folder picker opens.
 */
export function registerScriptDirCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(ADD_LEGACY_DIR_COMMAND, (directory?: string) =>
      addScriptDirectory("legacyScriptDirectories", directory),
    ),
    vscode.commands.registerCommand(ADD_ADDITIONAL_DIR_COMMAND, (directory?: string) =>
      addScriptDirectory("additionalScriptDirectories", directory),
    ),
  );
}

async function addScriptDirectory(
  settingKey: string,
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

  const config = vscode.workspace.getConfiguration("witcherscript");
  const current = config.get<string[]>(settingKey) ?? [];
  const toAdd: string[] = [];
  for (const dir of picked) {
    if (!current.includes(dir) && !toAdd.includes(dir)) toAdd.push(dir);
  }
  if (toAdd.length === 0) {
    await vscode.window.showInformationMessage(
      picked.length === 1
        ? `"${picked[0]}" is already in ${settingKey}.`
        : `All selected folders are already in ${settingKey}.`,
    );
    return;
  }

  await config.update(settingKey, [...current, ...toAdd], vscode.ConfigurationTarget.Workspace);
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
