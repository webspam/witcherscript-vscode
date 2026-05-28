import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { configs, displayName } from "./generated-meta";

/** Server → client push; the server owns the base game script tree, so only it can decide this. */
const FILE_SCOPE_STATUS_NOTIFICATION = "witcherscript/fileScopeStatus";

/** `@id:` filters the Settings editor to exactly this setting. */
const idFilter = `@id:${configs.legacyScriptDirectories.key}`;

const REMOVE_LEGACY_DIR_COMMAND = "witcherscript.removeLegacyScriptDirectory";

type FileScope =
  | "InProject"
  | "LegacyOverride"
  | "LegacyNew"
  | "AdditionalBase"
  | "OutOfScope"
  | "SingleFile";

interface FileScopeStatus {
  uri: string;
  scope: FileScope;
  /** Game-relative path of the script being replaced, for the tooltip. */
  replacedScriptPath?: string;
}

const statusByUri = new Map<string, FileScopeStatus>();
let statusBar: vscode.StatusBarItem;
let notificationListener: vscode.Disposable | undefined;

/**
 * A second, contextual status bar item — distinct from the health item in
 * statusBar.ts. It only shows while a base-script-replacing file is the active
 * editor, so it doesn't compete for permanent space.
 */
export function registerLegacyScriptStatusBar(context: vscode.ExtensionContext): void {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
  statusBar.name = `${displayName} Legacy Script`;
  statusBar.text = "$(replace)";
  statusBar.accessibilityInformation = { label: "Replaces a base game script" };
  statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
  statusBar.command = {
    command: "workbench.action.openSettings",
    title: "Open legacy script directory settings",
    arguments: [idFilter],
  };
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.commands.registerCommand(REMOVE_LEGACY_DIR_COMMAND, removeLegacyScriptDirectory),
    vscode.window.onDidChangeActiveTextEditor(renderLegacyScriptStatus),
    vscode.workspace.onDidCloseTextDocument(forgetClosedDocument),
  );
  renderLegacyScriptStatus();
}

/** Re-registers the handler on every client (re)start; stale per-document state is dropped. */
export function setLegacyScriptStatusClient(client: LanguageClient | undefined): void {
  notificationListener?.dispose();
  notificationListener = undefined;
  statusByUri.clear();
  renderLegacyScriptStatus();

  if (!client) return;

  notificationListener = client.onNotification(
    FILE_SCOPE_STATUS_NOTIFICATION,
    handleFileScopeStatus,
  );
}

function handleFileScopeStatus(status: FileScopeStatus): void {
  statusByUri.set(status.uri, status);
  renderLegacyScriptStatus();
}

function forgetClosedDocument(document: vscode.TextDocument): void {
  statusByUri.delete(document.uri.toString());
}

function renderLegacyScriptStatus(): void {
  const editor = vscode.window.activeTextEditor;
  const status = editor ? statusByUri.get(editor.document.uri.toString()) : undefined;

  if (status?.scope !== "LegacyOverride") {
    statusBar.hide();
    return;
  }

  statusBar.tooltip = buildLegacyTooltip(status);
  statusBar.show();
}

function getLegacyScriptDirectories(): string[] {
  const { default: defaultValue, key } = configs.legacyScriptDirectories;
  return vscode.workspace.getConfiguration().get(key, defaultValue);
}

async function removeLegacyScriptDirectory(dir: string): Promise<void> {
  if (typeof dir !== "string" || dir.length === 0) return;

  const current = getLegacyScriptDirectories();
  const updated = current.filter(d => d !== dir);

  if (updated.length === current.length) return;

  const target = vscode.workspace.workspaceFolders?.length
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
  const config = vscode.workspace.getConfiguration();
  await config.update(configs.legacyScriptDirectories.key, updated, target);
}

function findMatchingLegacyDirs(fileUri: string): string[] {
  const filePath = vscode.Uri.parse(fileUri).fsPath.toLowerCase();
  const dirs = getLegacyScriptDirectories();

  if (!dirs || dirs.length === 0) return [];

  const matching: string[] = [];
  for (const dir of dirs) {
    const dirPath = vscode.Uri.file(dir).fsPath.toLowerCase();
    if (filePath.startsWith(dirPath + "\\") || filePath.startsWith(dirPath + "/")) {
      matching.push(dir);
    }
  }
  return matching;
}

function buildLegacyTooltip(status: FileScopeStatus): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = { enabledCommands: ["workbench.action.openSettings", REMOVE_LEGACY_DIR_COMMAND] };

  const settingsArg = encodeURIComponent(JSON.stringify([idFilter]));
  const settingsLink = `[$(gear)](command:workbench.action.openSettings?${settingsArg} "Open settings")`;
  md.appendMarkdown(
    `$(replace) **This file is replacing a base game script** | ${settingsLink}\n\n`,
  );

  const matchingDirs = findMatchingLegacyDirs(status.uri);
  if (matchingDirs.length === 0) return md;

  md.appendMarkdown(`Matching legacy directories:\n\n`);
  for (const dir of matchingDirs) {
    const removeArg = encodeURIComponent(JSON.stringify([dir]));
    const displayDir = vscode.workspace.asRelativePath(dir);
    md.appendMarkdown(
      `[$(trash)](command:${REMOVE_LEGACY_DIR_COMMAND}?${removeArg} "Remove this directory") \`${displayDir}\`  \n`,
    );
  }

  return md;
}
