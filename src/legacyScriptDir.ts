import * as path from "path";
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

/**
 * A second, contextual status bar item — distinct from the health item in
 * statusBar.ts. It only shows while a legacy script is the active editor, so
 * it doesn't compete for permanent space.
 */
export function registerLegacyScriptStatusBar(context: vscode.ExtensionContext): void {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  statusBar.name = "WitcherScript Legacy Script";
  statusBar.text = "$(history) Legacy script";
  statusBar.tooltip =
    "This file is under a witcherscript.legacyScriptDirectories root — it replaces the base game script at the same path.";
  // VS Code only honors errorBackground/warningBackground here; there is no info variant.
  statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
  context.subscriptions.push(statusBar);

  const update = (): void => {
    if (isActiveFileLegacyScript()) statusBar.show();
    else statusBar.hide();
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(update),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("witcherscript.legacyScriptDirectories")) update();
    }),
  );
  update();
}

function isActiveFileLegacyScript(): boolean {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "witcherscript") return false;
  if (editor.document.uri.scheme !== "file") return false;

  const filePath = editor.document.uri.fsPath;
  const directories =
    vscode.workspace.getConfiguration("witcherscript").get<string[]>("legacyScriptDirectories") ??
    [];
  return directories.some(directory => isPathInside(filePath, directory));
}

/** `path.relative` on win32 compares case-insensitively, which is what we want here. */
function isPathInside(filePath: string, directory: string): boolean {
  const relative = path.relative(directory, filePath);
  return relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative);
}
