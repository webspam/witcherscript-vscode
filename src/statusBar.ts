import * as vscode from "vscode";
import { resolveGameDirectory } from "./gameDirectory";
import { commands, displayName } from "./generated-meta";

export type ServerState = "starting" | "running" | "stopped";

let statusBar: vscode.StatusBarItem;
let outputChannel: vscode.LogOutputChannel;
let serverState: ServerState = "starting";
let serverErrorDetail: string | undefined;
let serverBusy = false;
let busySpinnerEnabled = false;
let gameDirectorySet = false;

/** Undeclared in package.json on purpose — power-user opt-in, not surfaced in the settings UI. */
function readBusySpinnerSetting(): boolean {
  return vscode.workspace.getConfiguration("witcherscript").get<boolean>("showBusySpinner", false);
}

/**
 * Single status bar item that owns all WitcherScript health signals
 * (LSP state + game directory). One item avoids the poor UX of multiple
 * extension entries fighting for space in the status bar.
 */
export function registerStatusBar(
  context: vscode.ExtensionContext,
  channel: vscode.LogOutputChannel,
  initialGameDirectorySet: boolean,
): void {
  outputChannel = channel;
  gameDirectorySet = initialGameDirectorySet;
  busySpinnerEnabled = readBusySpinnerSetting();

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.name = displayName;
  statusBar.command = "witcherscript.showStatusMenu";
  context.subscriptions.push(statusBar);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("witcherscript.gameDirectory")) {
        setGameDirectorySet(!!resolveGameDirectory());
      }
      if (e.affectsConfiguration("witcherscript.showBusySpinner")) {
        busySpinnerEnabled = readBusySpinnerSetting();
        render();
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.showStatusMenu", showStatusMenu),
  );

  render();
  statusBar.show();
}

export function setServerState(state: ServerState, errorDetail?: string): void {
  serverState = state;
  serverErrorDetail = state === "stopped" ? errorDetail : undefined;
  render();
}

export function setServerBusy(busy: boolean): void {
  if (serverBusy === busy) return;
  serverBusy = busy;
  render();
}

function setGameDirectorySet(set: boolean): void {
  gameDirectorySet = set;
  render();
}

function render(): void {
  if (serverState === "stopped") {
    statusBar.text = `$(debug-disconnect) ${displayName}: server stopped`;
    statusBar.tooltip = serverErrorDetail
      ? `${serverErrorDetail} Click for actions.`
      : "Language server stopped. Click for actions.";
    statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    return;
  }
  if (!gameDirectorySet) {
    statusBar.text = `$(warning) ${displayName}: set game directory`;
    statusBar.tooltip =
      "The Witcher 3 game directory is not set, so the language server cannot locate base game scripts. Click for actions.";
    statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    return;
  }
  if (serverState === "starting") {
    statusBar.text = `$(debug-disconnect) ${displayName}`;
    statusBar.tooltip = `${displayName} language server is starting. Click for actions.`;
    statusBar.backgroundColor = undefined;
    return;
  }
  if (serverBusy && busySpinnerEnabled) {
    statusBar.text = `$(sync~spin) ${displayName}`;
    statusBar.tooltip = `${displayName} language server is processing a request. Click for actions.`;
    statusBar.backgroundColor = undefined;
    return;
  }
  statusBar.text = `$(check) ${displayName}`;
  statusBar.tooltip = `${displayName} language server is running. Click for actions.`;
  statusBar.backgroundColor = undefined;
}

type MenuItem = vscode.QuickPickItem & { run: () => Thenable<unknown> | void };

async function showStatusMenu(): Promise<void> {
  const items: MenuItem[] = [
    {
      label: "$(refresh) Restart language server",
      run: () => vscode.commands.executeCommand(commands.restartServer),
    },
    {
      label: "$(output) Show output",
      run: () => outputChannel.show(true),
    },
  ];
  if (!gameDirectorySet) {
    items.push({
      label: "$(folder) Set game directory…",
      run: () => vscode.commands.executeCommand("witcherscript.setGameDirectory"),
    });
  }
  items.push({
    label: "$(settings-gear) Open settings",
    run: () => vscode.commands.executeCommand("workbench.action.openSettings", "witcherscript"),
  });

  const picked = await vscode.window.showQuickPick(items, { placeHolder: displayName });
  if (picked) await picked.run();
}
