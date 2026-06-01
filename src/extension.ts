import * as vscode from "vscode";
import { registerBuiltinContentProvider } from "./builtinContent";
import {
  initClient,
  startClient,
  restartClient,
  stopClient,
  goToLocation,
  showReferences,
} from "./client";
import {
  resolveGameDirectory,
  setGameDirectory,
  registerGameDirectoryContextKey,
} from "./gameDirectory";
import { registerLegacyScriptStatusBar } from "./legacyScriptStatus";
import { registerScriptDirCommands } from "./scriptDirCommands";
import { registerStatusBar } from "./statusBar";
import { commands, configs, displayName } from "./generated-meta";

/** Module-scope state is captured for the restart flow. */
export function activate(context: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel(displayName, { log: true });
  context.subscriptions.push(channel);

  initClient(context, channel);
  registerBuiltinContentProvider(context, channel);

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.setGameDirectory", () =>
      setGameDirectory(restartClient),
    ),
    vscode.commands.registerCommand(commands.restartServer, () => restartClient()),
    vscode.commands.registerCommand(commands.goToBaseDefinition, goToLocation),
    vscode.commands.registerCommand(commands.showReferences, (_uri, _position, _locations) =>
      showReferences(_uri, _position, _locations),
    ),
    vscode.commands.registerCommand(commands.openWalkthrough, () =>
      vscode.commands.executeCommand(
        "workbench.action.openWalkthrough",
        "webspam.witcherscript#witcherscript.gettingStarted",
      ),
    ),
    vscode.commands.registerCommand(commands.enableReferencesCodeLens, () =>
      setReferencesCodeLens(true),
    ),
    vscode.commands.registerCommand(commands.disableReferencesCodeLens, () =>
      setReferencesCodeLens(false),
    ),
  );

  registerScriptDirCommands(context);
  registerLegacyScriptStatusBar(context);

  const gameDirectory = resolveGameDirectory(channel);
  registerStatusBar(context, channel, !!gameDirectory);
  registerGameDirectoryContextKey(context, gameDirectory);
  registerTcpPortRestart(context);
  startClient(gameDirectory);
}

/**
 * The walkthrough's two tiles act as a radio pair: each sets a fixed value, so
 * re-clicking the selected tile re-asserts rather than toggles. Global scope:
 * it's an editor preference, not per-workspace.
 */
async function setReferencesCodeLens(enabled: boolean): Promise<void> {
  await vscode.workspace
    .getConfiguration()
    .update(configs.codeLensReferences.key, enabled, vscode.ConfigurationTarget.Global);
}

/** `tcpPort` is read once at boot, so changes require a restart. */
function registerTcpPortRestart(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(configs.serverTcpPort.key)) {
        await restartClient();
      }
    }),
  );
}

/**
 * VS Code awaits the Thenable so the server process exits before the host
 * — otherwise orphans accumulate across reloads. Everything else lives in
 * `context.subscriptions` and is disposed automatically.
 */
export function deactivate(): Thenable<void> | undefined {
  return stopClient();
}
