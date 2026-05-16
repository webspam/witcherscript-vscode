import * as fs from "fs";
import * as net from "net";
import * as path from "path";
import { execSync } from "child_process";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;
let extensionContext: vscode.ExtensionContext;
let sharedOutputChannel: vscode.OutputChannel;

/** Module-scope state is captured for the restart flow. */
export function activate(context: vscode.ExtensionContext): void {
  extensionContext = context;
  sharedOutputChannel = vscode.window.createOutputChannel("WitcherScript");
  context.subscriptions.push(sharedOutputChannel);

  context.subscriptions.push(
    vscode.commands.registerCommand("witcherscript.setGameDirectory", setGameDirectory),
  );

  registerGameDirectoryStatusBar(context, sharedOutputChannel);

  startClient();
}

/**
 * VS Code awaits the Thenable so the server process exits before the host
 * — otherwise orphans accumulate across reloads. Everything else lives in
 * `context.subscriptions` and is disposed automatically.
 */
export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }

  return client.stop();
}

/**
 * The TCP branch is for the LSP-dev workflow — attach to a server running
 * under a debugger via `witcherscript.server.tcpPort`. End users take stdio.
 * `initializationOptions` are read once at boot; see {@link restartClient}.
 */
function startClient(): void {
  const tcpPort = Number(vscode.workspace.getConfiguration("witcherscript").get("server.tcpPort"));

  let serverOptions: ServerOptions;
  if (Number.isInteger(tcpPort) && tcpPort > 0 && tcpPort <= 65535) {
    sharedOutputChannel.appendLine(
      `Connecting to externally running language server on 127.0.0.1:${tcpPort} (witcherscript.server.tcpPort).`,
    );
    serverOptions = () =>
      new Promise((resolve, reject) => {
        const socket = net.connect({ host: "127.0.0.1", port: tcpPort });
        socket.once("connect", () => {
          socket.removeListener("error", reject);
          resolve({ writer: socket, reader: socket });
        });
        socket.once("error", reject);
      });
  } else {
    const serverPath = resolveServerPath(extensionContext);
    if (!serverPath) {
      vscode.window.showWarningMessage(
        "WitcherScript language server not found. Set witcherscript.server.path or reinstall the extension with the bundled server.",
      );
      return;
    }
    serverOptions = {
      command: serverPath,
      transport: TransportKind.stdio,
    };
  }

  const gameDirectory = resolveGameDirectory(sharedOutputChannel);

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
    outputChannel: sharedOutputChannel,
  };

  client = new LanguageClient(
    "witcherscriptLanguageServer",
    "WitcherScript Language Server",
    serverOptions,
    clientOptions,
  );
  client.start();
}

/**
 * Settings in `initializationOptions` (notably gameDirectory) are baked in
 * at server boot — no live-update LSP message exists — so applying changes
 * requires a full restart.
 */
async function restartClient(): Promise<void> {
  if (client) {
    await client.stop();
    client = undefined;
  }
  startClient();
}

/**
 * The `content/` check catches the common mistake of picking a mod folder
 * or the install's parent. Global scope because the install path is
 * per-machine, not per-workspace.
 */
async function setGameDirectory(): Promise<void> {
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: "Select Witcher 3 Folder",
    title: "Select your Witcher 3 game directory",
  });
  if (!picked || picked.length === 0) {
    return;
  }

  const dir = picked[0].fsPath;
  if (!fs.existsSync(path.join(dir, "content"))) {
    const useAnyway = "Use Anyway";
    const choice = await vscode.window.showWarningMessage(
      `"${dir}" does not look like a Witcher 3 install (no content folder). Use it anyway?`,
      useAnyway,
    );
    if (choice !== useAnyway) {
      return;
    }
  }

  await vscode.workspace
    .getConfiguration("witcherscript")
    .update("gameDirectory", dir, vscode.ConfigurationTarget.Global);

  await restartClient();
  vscode.window.showInformationMessage(
    "WitcherScript: game directory set. Language server restarted.",
  );
}

/**
 * Surfaces the missing-setup case proactively — otherwise the first signal
 * is a wall of unresolved base-game imports. Visibility uses
 * {@link resolveGameDirectory} (not the raw config) so auto-detected GOG
 * installs don't get nagged.
 */
function registerGameDirectoryStatusBar(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel,
): void {
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.name = "WitcherScript Game Directory";
  statusBar.text = "$(warning) WitcherScript: set game directory";
  statusBar.tooltip =
    "The Witcher 3 game directory is not set, so the language server cannot locate base game scripts. Click to select the folder.";
  statusBar.command = "witcherscript.setGameDirectory";
  statusBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
  context.subscriptions.push(statusBar);

  const syncVisibility = (): void => {
    if (resolveGameDirectory(outputChannel)) {
      statusBar.hide();
    } else {
      statusBar.show();
    }
  };

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("witcherscript.gameDirectory")) {
        syncVisibility();
      }
    }),
  );

  syncVisibility();
}

/**
 * Detected-but-missing logs so users who moved/uninstalled the game see why
 * detection failed. Returns "" (not undefined) so callers can forward
 * straight into LSP options — the server treats empty as "not configured".
 */
function resolveGameDirectory(outputChannel: vscode.OutputChannel): string {
  const configured = vscode.workspace
    .getConfiguration("witcherscript")
    .get<string>("gameDirectory");
  if (configured) {
    return configured;
  }

  if (process.platform !== "win32") {
    return "";
  }

  const detected = detectGogGameDirectory();
  if (!detected) {
    return "";
  }

  if (!fs.existsSync(detected)) {
    outputChannel.appendLine(
      `WitcherScript: GOG registry lists game directory "${detected}", but it does not exist. Set witcherscript.gameDirectory manually.`,
    );
    return "";
  }

  outputChannel.appendLine(
    `WitcherScript: witcherscript.gameDirectory is not set; using GOG installation path from registry: ${detected}`,
  );
  return detected;
}

/**
 * `1495134320` is GOG's stable product ID for Witcher 3. Shelling out to
 * `reg` avoids a native-module dep for a single boot-time read.
 */
function detectGogGameDirectory(): string {
  const key = "HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1495134320";
  try {
    const output = execSync(`reg query "${key}" /v path`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const match = output.match(/^\s*path\s+REG_SZ\s+(.+?)\s*$/m);
    return match ? match[1] : "";
  } catch {
    return "";
  }
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
