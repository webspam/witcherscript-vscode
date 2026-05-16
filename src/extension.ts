import * as vscode from "vscode";
import { initClient, startClient, restartClient, stopClient } from "./client";
import {
  resolveGameDirectory,
  setGameDirectory,
  registerGameDirectoryStatusBar,
  registerGameDirectoryContextKey,
} from "./gameDirectory";

/** Module-scope state is captured for the restart flow. */
export function activate(context: vscode.ExtensionContext): void {
  const channel = vscode.window.createOutputChannel("WitcherScript", { log: true });
  context.subscriptions.push(channel);

  initClient(context, channel);

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.setGameDirectory", () =>
      setGameDirectory(restartClient),
    ),
  );

  const gameDirectory = resolveGameDirectory(channel);
  registerGameDirectoryStatusBar(context, gameDirectory);
  registerGameDirectoryContextKey(context, gameDirectory);
  startClient(gameDirectory);
}

/**
 * VS Code awaits the Thenable so the server process exits before the host
 * — otherwise orphans accumulate across reloads. Everything else lives in
 * `context.subscriptions` and is disposed automatically.
 */
export function deactivate(): Thenable<void> | undefined {
  return stopClient();
}
