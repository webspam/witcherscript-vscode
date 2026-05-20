import * as vscode from "vscode";

const ADD_LEGACY_DIR_COMMAND = "witcherscript.addLegacyScriptDirectory";

/** Invoked by the server's `base_script_conflict` code action, with the directory as argument. */
export function registerAddLegacyScriptDirCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(ADD_LEGACY_DIR_COMMAND, addLegacyScriptDirectory),
  );
}

async function addLegacyScriptDirectory(directory: string): Promise<void> {
  if (typeof directory !== "string" || directory.length === 0) return;

  const config = vscode.workspace.getConfiguration("witcherscript");
  const current = config.get<string[]>("legacyScriptDirectories") ?? [];
  if (current.includes(directory)) {
    await vscode.window.showInformationMessage(
      `"${directory}" is already in legacyScriptDirectories.`,
    );
    return;
  }

  const target = vscode.workspace.workspaceFolders?.length
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
  await config.update("legacyScriptDirectories", [...current, directory], target);
}
