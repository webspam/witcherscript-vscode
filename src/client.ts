import * as fs from "fs";
import * as net from "net";
import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  State,
  TransportKind,
} from "vscode-languageclient/node";
import { resolveGameDirectory } from "./gameDirectory";
import { setServerState } from "./statusBar";

let client: LanguageClient | undefined;
let extensionContext: vscode.ExtensionContext;
let outputChannel: vscode.LogOutputChannel;
/** Distinguishes a deliberate `stop()` from a crashed server in onDidChangeState. */
let intentionalStop = false;

export function initClient(
  context: vscode.ExtensionContext,
  channel: vscode.LogOutputChannel,
): void {
  extensionContext = context;
  outputChannel = channel;
}

export function stopClient(): Promise<void> {
  return stopClientSafely();
}

/**
 * `client.stop()` rejects with "Cannot call write after a stream was destroyed"
 * when the underlying transport already died (TCP socket closed, server crashed).
 * Swallow it so deactivate and restart don't surface a useless error.
 */
async function stopClientSafely(): Promise<void> {
  if (!client) return;
  intentionalStop = true;
  try {
    await client.stop();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    outputChannel.warn(`Stopping language server failed: ${message}`);
    setServerState("stopped", `Language server stop failed: ${message}`);
  } finally {
    client = undefined;
    intentionalStop = false;
  }
}

/**
 * The TCP branch is for the LSP-dev workflow — attach to a server running
 * under a debugger via `witcherscript.server.tcpPort`. End users take stdio.
 * `initializationOptions` are read once at boot; see {@link restartClient}.
 */
export function startClient(gameDirectory: string): void {
  const tcpPort = Number(vscode.workspace.getConfiguration("witcherscript").get("server.tcpPort"));

  let serverOptions: ServerOptions;
  if (Number.isInteger(tcpPort) && tcpPort > 0 && tcpPort <= 65535) {
    outputChannel.appendLine(
      `Connecting to externally running language server on 127.0.0.1:${tcpPort} (witcherscript.server.tcpPort).`,
    );
    serverOptions = () => connectToTcpServer(tcpPort);
  } else {
    const serverPath = resolveServerPath(extensionContext);
    if (!serverPath) {
      vscode.window.showWarningMessage(
        "WitcherScript language server not found. Set witcherscript.server.path or reinstall the extension with the bundled server.",
      );
      setServerState("stopped", "Language server binary not found.");
      return;
    }
    serverOptions = {
      command: serverPath,
      transport: TransportKind.stdio,
    };
  }

  const config = vscode.workspace.getConfiguration("witcherscript");
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "witcherscript" },
      { scheme: "untitled", language: "witcherscript" },
    ],
    synchronize: {
      configurationSection: "witcherscript",
    },
    initializationOptions: {
      gameDirectory,
      additionalScriptDirectories: config.get("additionalScriptDirectories") ?? [],
      autoLoadModSharedImports: config.get("autoLoadModSharedImports") ?? true,
      logLevel:
        extensionContext.extensionMode === vscode.ExtensionMode.Development
          ? "trace"
          : (config.get("logLevel") ?? "warn"),
      formatter: {
        lineLimit: config.get("formatter.lineLimit") ?? 100,
        compactColon: config.get("formatter.compactColon") ?? false,
        alignMemberColons: config.get("formatter.alignMemberColons") ?? false,
      },
    },
    outputChannel,
  };

  client = new LanguageClient(
    "witcherscriptLanguageServer",
    "WitcherScript Language Server",
    serverOptions,
    clientOptions,
  );
  client.onDidChangeState(({ newState }) => {
    if (newState === State.Running) setServerState("running");
    else if (newState === State.Starting) setServerState("starting");
    else if (newState === State.Stopped && !intentionalStop) {
      setServerState("stopped", "Language server stopped unexpectedly.");
    }
  });
  client.start();
}

function connectToTcpServer(port: number): Promise<{ writer: net.Socket; reader: net.Socket }> {
  return new Promise(resolve => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const onError = async () => {
      socket.destroy();
      await handleTcpConnectionError(port);
    };
    socket.once("connect", () => {
      socket.removeListener("error", onError);
      resolve({ writer: socket, reader: socket });
    });
    socket.once("error", onError);
  });
}

async function handleTcpConnectionError(port: number): Promise<void> {
  outputChannel.trace(`TCP port ${port} unreachable — showing recovery dialog.`);
  const useBundled = "Use Bundled Server";
  const choice = await vscode.window.showErrorMessage(
    `WitcherScript: couldn't connect to language server on 127.0.0.1:${port}. ` +
      `The port is set via witcherscript.server.tcpPort for LSP development.`,
    useBundled,
    "Open Settings",
    "Retry",
  );
  outputChannel.trace(`Recovery dialog choice: ${choice ?? "(dismissed)"}`);
  await stopClientSafely();
  if (choice === useBundled) {
    await clearTcpPortSetting();
    startClient(resolveGameDirectory());
  } else if (choice === "Retry") {
    startClient(resolveGameDirectory());
  } else {
    setServerState("stopped", `Could not connect to language server on 127.0.0.1:${port}.`);
    if (choice === "Open Settings") {
      void vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "witcherscript.server.tcpPort",
      );
    }
  }
}

async function clearTcpPortSetting(): Promise<void> {
  const config = vscode.workspace.getConfiguration("witcherscript");
  const inspection = config.inspect<number>("server.tcpPort");
  if (inspection?.globalValue !== undefined)
    await config.update("server.tcpPort", undefined, vscode.ConfigurationTarget.Global);
  if (inspection?.workspaceValue !== undefined)
    await config.update("server.tcpPort", undefined, vscode.ConfigurationTarget.Workspace);
  if (inspection?.workspaceFolderValue !== undefined)
    await config.update("server.tcpPort", undefined, vscode.ConfigurationTarget.WorkspaceFolder);
}

/**
 * Settings in `initializationOptions` (notably gameDirectory) are baked in
 * at server boot — no live-update LSP message exists — so applying changes
 * requires a full restart.
 */
export async function restartClient(): Promise<void> {
  await stopClientSafely();
  startClient(resolveGameDirectory());
}

/** Explicit `server.path` wins so LSP devs can point at a local build. */
function resolveServerPath(context: vscode.ExtensionContext): string | undefined {
  const configuredPath = vscode.workspace
    .getConfiguration("witcherscript")
    .get<string>("server.path");

  if (configuredPath && fs.existsSync(configuredPath)) {
    return configuredPath;
  }

  const executable = process.platform === "win32" ? "witcherscript-lsp.exe" : "witcherscript-lsp";
  const candidates = [context.asAbsolutePath(path.join("server", executable))];

  return candidates.find(candidate => fs.existsSync(candidate));
}
