import * as vscode from "vscode";
import { registerBuiltinContentProvider } from "./builtinContent";
import { initClient, startClient, restartClient, stopClient } from "./client";
import {
  resolveGameDirectory,
  setGameDirectory,
  registerGameDirectoryContextKey,
} from "./gameDirectory";
import {
  registerAddLegacyScriptDirCommand,
  registerLegacyScriptStatusBar,
} from "./legacyScriptDir";
import { registerStatusBar } from "./statusBar";

/** Module-scope state is captured for the restart flow. */
export function activate(context: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel("WitcherScript", { log: true });
  context.subscriptions.push(channel);

  initClient(context, channel);
  registerBuiltinContentProvider(context, channel);

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.setGameDirectory", () =>
      setGameDirectory(restartClient),
    ),
    vscode.commands.registerCommand("witcherscript.restartServer", () => restartClient()),
  );

  registerAddLegacyScriptDirCommand(context);
  registerLegacyScriptStatusBar(context);

  const gameDirectory = resolveGameDirectory(channel);
  registerStatusBar(context, channel, !!gameDirectory);
  registerGameDirectoryContextKey(context, gameDirectory);
  registerTcpPortRestart(context);
  startClient(gameDirectory);
}

/** `tcpPort` is read once at boot, so changes require a restart. */
function registerTcpPortRestart(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration("witcherscript.server.tcpPort")) {
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
