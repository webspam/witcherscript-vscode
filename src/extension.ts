import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { execSync } from 'child_process';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let extensionContext: vscode.ExtensionContext;
let sharedOutputChannel: vscode.OutputChannel;
let gameDirectoryStatusBar: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  extensionContext = context;
  sharedOutputChannel = vscode.window.createOutputChannel('WitcherScript');
  context.subscriptions.push(sharedOutputChannel);

  context.subscriptions.push(
    vscode.commands.registerCommand('witcherscript.setGameDirectory', setGameDirectory)
  );

  gameDirectoryStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  gameDirectoryStatusBar.name = 'WitcherScript Game Directory';
  gameDirectoryStatusBar.text = '$(warning) WitcherScript: set game directory';
  gameDirectoryStatusBar.tooltip =
    'The Witcher 3 game directory is not set, so the language server cannot locate base game scripts. Click to select the folder.';
  gameDirectoryStatusBar.command = 'witcherscript.setGameDirectory';
  gameDirectoryStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  context.subscriptions.push(gameDirectoryStatusBar);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('witcherscript.gameDirectory')) {
        updateGameDirectoryStatusBar(resolveGameDirectory(sharedOutputChannel));
      }
    })
  );

  startClient();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }

  return client.stop();
}

function startClient(): void {
  const tcpPort = Number(
    vscode.workspace.getConfiguration('witcherscript').get('server.tcpPort')
  );

  let serverOptions: ServerOptions;
  if (Number.isInteger(tcpPort) && tcpPort > 0 && tcpPort <= 65535) {
    sharedOutputChannel.appendLine(
      `Connecting to externally running language server on 127.0.0.1:${tcpPort} (witcherscript.server.tcpPort).`
    );
    serverOptions = () =>
      new Promise((resolve, reject) => {
        const socket = net.connect({ host: '127.0.0.1', port: tcpPort });
        socket.once('connect', () => {
          socket.removeListener('error', reject);
          resolve({ writer: socket, reader: socket });
        });
        socket.once('error', reject);
      });
  } else {
    const serverPath = resolveServerPath(extensionContext);
    if (!serverPath) {
      vscode.window.showWarningMessage(
        'WitcherScript language server not found. Set witcherscript.server.path or reinstall the extension with the bundled server.'
      );
      return;
    }
    serverOptions = {
      command: serverPath,
      transport: TransportKind.stdio,
    };
  }

  const gameDirectory = resolveGameDirectory(sharedOutputChannel);
  updateGameDirectoryStatusBar(gameDirectory);

  const config = vscode.workspace.getConfiguration('witcherscript');
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'witcherscript' },
      { scheme: 'untitled', language: 'witcherscript' },
    ],
    synchronize: {
      configurationSection: 'witcherscript',
    },
    initializationOptions: {
      gameDirectory,
      additionalScriptDirectories: config.get('additionalScriptDirectories') ?? [],
      autoLoadModSharedImports: config.get('autoLoadModSharedImports') ?? true,
      logLevel: config.get('logLevel') ?? 'warn',
      formatter: {
        lineLimit: config.get('formatter.lineLimit') ?? 100,
        compactColon: config.get('formatter.compactColon') ?? false,
        alignMemberColons: config.get('formatter.alignMemberColons') ?? false,
      },
    },
    outputChannel: sharedOutputChannel,
  };

  client = new LanguageClient(
    'witcherscriptLanguageServer',
    'WitcherScript Language Server',
    serverOptions,
    clientOptions
  );
  client.start();
}

async function restartClient(): Promise<void> {
  if (client) {
    await client.stop();
    client = undefined;
  }
  startClient();
}

async function setGameDirectory(): Promise<void> {
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Select Witcher 3 Folder',
    title: 'Select your Witcher 3 game directory',
  });
  if (!picked || picked.length === 0) {
    return;
  }

  const dir = picked[0].fsPath;
  if (!fs.existsSync(path.join(dir, 'content'))) {
    const useAnyway = 'Use Anyway';
    const choice = await vscode.window.showWarningMessage(
      `"${dir}" does not look like a Witcher 3 install (no content folder). Use it anyway?`,
      useAnyway
    );
    if (choice !== useAnyway) {
      return;
    }
  }

  await vscode.workspace
    .getConfiguration('witcherscript')
    .update('gameDirectory', dir, vscode.ConfigurationTarget.Global);

  await restartClient();
  vscode.window.showInformationMessage(
    'WitcherScript: game directory set. Language server restarted.'
  );
}

function updateGameDirectoryStatusBar(gameDirectory: string): void {
  if (gameDirectory) {
    gameDirectoryStatusBar.hide();
  } else {
    gameDirectoryStatusBar.show();
  }
}

function resolveGameDirectory(outputChannel: vscode.OutputChannel): string {
  const configured = vscode.workspace
    .getConfiguration('witcherscript')
    .get<string>('gameDirectory');
  if (configured) {
    return configured;
  }

  if (process.platform !== 'win32') {
    return '';
  }

  const detected = detectGogGameDirectory();
  if (!detected) {
    return '';
  }

  if (!fs.existsSync(detected)) {
    outputChannel.appendLine(
      `WitcherScript: GOG registry lists game directory "${detected}", but it does not exist. Set witcherscript.gameDirectory manually.`
    );
    return '';
  }

  outputChannel.appendLine(
    `WitcherScript: witcherscript.gameDirectory is not set; using GOG installation path from registry: ${detected}`
  );
  return detected;
}

function detectGogGameDirectory(): string {
  const key = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1495134320';
  try {
    const output = execSync(`reg query "${key}" /v path`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const match = output.match(/^\s*path\s+REG_SZ\s+(.+?)\s*$/m);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function resolveServerPath(context: vscode.ExtensionContext): string | undefined {
  const configuredPath = vscode.workspace
    .getConfiguration('witcherscript')
    .get<string>('server.path');
  if (configuredPath && fs.existsSync(configuredPath)) {
    return configuredPath;
  }

  const executable = process.platform === 'win32' ? 'witcherscript-lsp.exe' : 'witcherscript-lsp';
  const candidates = [context.asAbsolutePath(path.join('server', executable))];

  return candidates.find((candidate) => fs.existsSync(candidate));
}
