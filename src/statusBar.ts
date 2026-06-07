import * as vscode from "vscode";
import {
  TOGGLE_BASE_SCRIPTS_COMMAND,
  getBaseScriptsDirectory,
  isOverridingBaseScripts,
  toggleBaseScriptsOverride,
} from "./baseScripts";
import { resolveGameDirectory } from "./gameDirectory";
import { commands, displayName, extensionId } from "./generated-meta";

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
      if (
        e.affectsConfiguration("witcherscript.useBaseScriptsDirectory") ||
        e.affectsConfiguration("witcherscript.baseScriptsDirectory")
      ) {
        render();
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.showStatusMenu", showStatusMenu),
    vscode.commands.registerCommand(commands.showOutput, showOutput),
    vscode.commands.registerCommand(TOGGLE_BASE_SCRIPTS_COMMAND, toggleBaseScriptsOverride),
  );

  render();
  statusBar.show();
}

function showOutput(): void {
  outputChannel.show(true);
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
    statusBar.text = `$(debug-disconnect) ${displayName}`;
    statusBar.tooltip = buildTooltip(serverErrorDetail ?? "Language server stopped.");
    statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    return;
  }
  if (!gameDirectorySet) {
    statusBar.text = `$(warning) ${displayName}`;
    statusBar.tooltip = buildTooltip(
      "The Witcher 3 game directory is not set, so the language server cannot locate base game scripts.",
    );
    statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    return;
  }
  if (serverState === "starting") {
    statusBar.text = `$(debug-disconnect) ${displayName}`;
    statusBar.tooltip = buildTooltip(`${displayName} language server is starting.`);
    statusBar.backgroundColor = undefined;
    return;
  }
  if (serverBusy && busySpinnerEnabled) {
    statusBar.text = `$(sync~spin) ${displayName}`;
    statusBar.tooltip = buildTooltip(`${displayName} language server is processing a request.`);
    statusBar.backgroundColor = undefined;
    return;
  }

  const icon = isOverridingBaseScripts() ? "$(check-all)" : "$(check)";
  statusBar.text = `${icon} ${displayName}`;
  statusBar.tooltip = buildTooltip(`${displayName} language server is running.`);
  statusBar.backgroundColor = undefined;
}

function buildTooltip(header: string): vscode.MarkdownString {
  const md = new vscode.MarkdownString(undefined, true);
  md.isTrusted = {
    enabledCommands: [
      commands.restartServer,
      commands.showOutput,
      TOGGLE_BASE_SCRIPTS_COMMAND,
      "workbench.action.openSettings",
    ],
  };

  md.appendMarkdown(`${header}\n\n`);

  const settingsArg = encodeURIComponent(JSON.stringify([`@ext:${extensionId}`]));
  const restart = `[$(refresh) Restart](command:${commands.restartServer} "Restart the language server")`;
  const logs = `[$(output) Logs](command:${commands.showOutput} "Show the WitcherScript output log")`;
  const settings = `[$(settings-gear) Settings](command:workbench.action.openSettings?${settingsArg} "Open WitcherScript settings")`;
  const buttons = [restart, logs, settings];

  const baseScripts = buildBaseScriptsButton();
  if (baseScripts) buttons.push(baseScripts);

  md.appendMarkdown(buttons.join(" &nbsp;|&nbsp; "));

  return md;
}

/** Returns undefined when no base scripts directory is set, so the button is not shown. */
function buildBaseScriptsButton(): string | undefined {
  if (getBaseScriptsDirectory().length === 0) return undefined;

  const on = isOverridingBaseScripts();
  const icon = on ? "$(check-all)" : "$(circle-slash)";
  const title = on ? "Use game directory scripts (default)" : "Swap to alternate base scripts";
  return `[${icon} Alternate Scripts](command:${TOGGLE_BASE_SCRIPTS_COMMAND} "${title}")`;
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
      run: showOutput,
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
