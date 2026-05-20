import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

/** Server → client push; the server owns the base game script tree, so only it can decide this. */
const LEGACY_SCRIPT_STATUS_NOTIFICATION = "witcherscript/legacyScriptStatus";

interface LegacyScriptStatus {
  uri: string;
  replacesBaseScript: boolean;
  /** Game-relative path of the script being replaced, for the tooltip. */
  replacedScriptPath?: string;
}

const statusByUri = new Map<string, LegacyScriptStatus>();
let statusBar: vscode.StatusBarItem;
let notificationListener: vscode.Disposable | undefined;

/**
 * A second, contextual status bar item — distinct from the health item in
 * statusBar.ts. It only shows while a base-script-replacing file is the active
 * editor, so it doesn't compete for permanent space.
 */
export function registerLegacyScriptStatusBar(context: vscode.ExtensionContext): void {
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  statusBar.name = "WitcherScript Legacy Script";
  statusBar.text = "$(history) Legacy script";
  // VS Code only honors errorBackground/warningBackground here; there is no info variant.
  statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
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
    LEGACY_SCRIPT_STATUS_NOTIFICATION,
    handleLegacyScriptStatus,
  );
}

function handleLegacyScriptStatus(status: LegacyScriptStatus): void {
  statusByUri.set(status.uri, status);
  renderLegacyScriptStatus();
}

function forgetClosedDocument(document: vscode.TextDocument): void {
  statusByUri.delete(document.uri.toString());
}

function renderLegacyScriptStatus(): void {
  const editor = vscode.window.activeTextEditor;
  const status = editor && statusByUri.get(editor.document.uri.toString());
  if (!status?.replacesBaseScript) {
    statusBar.hide();
    return;
  }
  statusBar.tooltip = status.replacedScriptPath
    ? `This file replaces the base game script: ${status.replacedScriptPath}`
    : "This file replaces a base game script of the same path.";
  statusBar.show();
}
