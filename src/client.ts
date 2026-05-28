import * as fs from "fs";
import * as net from "net";
import * as path from "path";
import * as vscode from "vscode";
import type { DocumentSelector } from "vscode-languageserver-protocol";
import {
  CloseAction,
  ErrorAction,
  LanguageClient,
  type ErrorHandler,
  type HandleDiagnosticsSignature,
  type LanguageClientOptions,
  type ServerOptions,
  State,
  TransportKind,
} from "vscode-languageclient/node";
import { setBuiltinClient } from "./builtinContent";
import { resolveGameDirectory } from "./gameDirectory";
import {
  configs,
  displayName,
  languages,
  scopedConfigs,
  type ConfigKeyTypeMap,
} from "./generated-meta";
import { setLegacyScriptStatusClient } from "./legacyScriptStatus";
import { setServerBusy, setServerState } from "./statusBar";

let client: LanguageClient | undefined;
let extensionContext: vscode.ExtensionContext;
let outputChannel: vscode.LogOutputChannel;
/** Distinguishes a deliberate `stop()` from a crashed server in onDidChangeState. */
let intentionalStop = false;
/** Count of outstanding client→server requests; drives the status bar busy spinner. */
let inFlightRequests = 0;

function adjustInFlight(delta: number): void {
  inFlightRequests = Math.max(0, inFlightRequests + delta);
  setServerBusy(inFlightRequests > 0);
}

function resetInFlight(): void {
  inFlightRequests = 0;
  setServerBusy(false);
}

/** Server reports via `textDocument/diagnostic` pulls; drop legacy push notifications. */
function ignorePushDiagnostics(
  _uri: vscode.Uri,
  _diagnostics: vscode.Diagnostic[],
  _next: HandleDiagnosticsSignature,
): void {}

/** Pull diagnostics for tabs where only the URI is known (e.g. built-in scripts). */
function matchesWitcherScriptDiagnosticResource(
  _documentSelector: DocumentSelector,
  resource: vscode.Uri,
): boolean {
  if (resource.scheme === "witcherscript-builtin") {
    return true;
  }
  if (resource.scheme === "untitled") {
    return true;
  }
  if (resource.scheme === "file") {
    return resource.path.endsWith(".ws");
  }
  return false;
}

/**
 * `handled: true` keeps the library's output-channel logging but suppresses
 * the modal popups it would otherwise force. The status bar already reflects
 * the stopped state via `onDidChangeState`, so the popups are redundant noise
 * — especially when an LSP dev restarts their TCP server.
 */
const silentErrorHandler: ErrorHandler = {
  error(_error, _message, count) {
    if (count !== undefined && count <= 3) {
      return { action: ErrorAction.Continue, handled: true };
    }
    return { action: ErrorAction.Shutdown, handled: true };
  },
  closed() {
    return { action: CloseAction.DoNotRestart, handled: true };
  },
};

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
    setBuiltinClient(undefined);
    setLegacyScriptStatusClient(undefined);
    resetInFlight();
  }
}

/**
 * The TCP branch is for the LSP-dev workflow — attach to a server running
 * under a debugger via `witcherscript.server.tcpPort`. End users take stdio.
 * `initializationOptions` are read once at boot; see {@link restartClient}.
 */
export function startClient(gameDirectory: string): void {
  const { serverTcpPort } = configs;
  const tcpPort = vscode.workspace.getConfiguration().get(serverTcpPort.key, serverTcpPort.default);

  let serverOptions: ServerOptions;
  if (Number.isInteger(tcpPort) && tcpPort > 0 && tcpPort <= 65535) {
    outputChannel.appendLine(
      `Connecting to externally running language server on 127.0.0.1:${tcpPort} (${serverTcpPort.key}).`,
    );
    serverOptions = () => connectToTcpServer(tcpPort);
  } else {
    const serverPath = resolveServerPath(extensionContext);
    if (!serverPath) {
      vscode.window.showWarningMessage(
        `${displayName} language server not found. Set ${configs.serverPath.key} or reinstall the extension with the bundled server.`,
      );
      setServerState("stopped", "Language server binary not found.");
      return;
    }
    serverOptions = {
      command: serverPath,
      transport: TransportKind.stdio,
    };
  }

  const config = vscode.workspace.getConfiguration();
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: languages.witcherscript },
      { scheme: "untitled", language: languages.witcherscript },
      { scheme: "witcherscript-builtin", language: languages.witcherscript },
    ],
    synchronize: {
      configurationSection: scopedConfigs.scope,
    },
    initializationOptions: {
      gameDirectory,
      additionalScriptDirectories: config.get(
        configs.additionalScriptDirectories.key,
        configs.additionalScriptDirectories.default,
      ),
      legacyScriptDirectories: config.get(
        configs.legacyScriptDirectories.key,
        configs.legacyScriptDirectories.default,
      ),
      autoLoadModSharedImports: config.get(
        configs.autoLoadModSharedImports.key,
        configs.autoLoadModSharedImports.default,
      ),
      diagnostics: {
        scope: config.get(configs.diagnosticsScope.key, configs.diagnosticsScope.default),
      },
      logLevel:
        extensionContext.extensionMode === vscode.ExtensionMode.Development
          ? "trace"
          : config.get(configs.logLevel.key, configs.logLevel.default),
      formatter: {
        lineLimit: config.get(configs.formatterLineLimit.key, configs.formatterLineLimit.default),
        compactColon: config.get(
          configs.formatterCompactColon.key,
          configs.formatterCompactColon.default,
        ),
        alignMemberColons: config.get(
          configs.formatterAlignMemberColons.key,
          configs.formatterAlignMemberColons.default,
        ),
        annotationPlacement: config.get(
          configs.formatterAnnotationPlacement.key,
          configs.formatterAnnotationPlacement.default,
        ),
      },
    },
    outputChannel,
    errorHandler: silentErrorHandler,
    diagnosticPullOptions: {
      onTabs: true,
      match: matchesWitcherScriptDiagnosticResource,
    },
    middleware: {
      handleDiagnostics: ignorePushDiagnostics,
      sendRequest: async (type, param, token, next) => {
        adjustInFlight(1);
        try {
          return await next(type, param, token);
        } finally {
          adjustInFlight(-1);
        }
      },
    },
  };

  client = new LanguageClient(
    "witcherscriptLanguageServer",
    `${displayName} Language Server`,
    serverOptions,
    clientOptions,
  );
  setBuiltinClient(client);
  setLegacyScriptStatusClient(client);
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
    `${displayName}: couldn't connect to language server on 127.0.0.1:${port}. ` +
      `The port is set via ${configs.serverTcpPort.key} for LSP development.`,
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
        configs.serverTcpPort.key,
      );
    }
  }
}

async function clearTcpPortSetting(): Promise<void> {
  const { key } = configs.serverTcpPort;
  const config = vscode.workspace.getConfiguration();
  const inspection = config.inspect<ConfigKeyTypeMap[typeof key]>(key);

  if (inspection?.globalValue !== undefined) {
    await config.update(key, undefined, vscode.ConfigurationTarget.Global);
  }
  if (inspection?.workspaceValue !== undefined) {
    await config.update(key, undefined, vscode.ConfigurationTarget.Workspace);
  }
  if (inspection?.workspaceFolderValue !== undefined) {
    await config.update(key, undefined, vscode.ConfigurationTarget.WorkspaceFolder);
  }
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
    .getConfiguration()
    .get(configs.serverPath.key, configs.serverPath.default);

  if (configuredPath && fs.existsSync(configuredPath)) {
    return configuredPath;
  }

  const executable = process.platform === "win32" ? "witcherscript-lsp.exe" : "witcherscript-lsp";
  const candidates = [context.asAbsolutePath(path.join("server", executable))];

  return candidates.find(candidate => fs.existsSync(candidate));
}
