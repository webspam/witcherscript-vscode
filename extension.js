const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

let client;

function activate(context) {
  const serverPath = resolveServerPath(context);
  if (!serverPath) {
    vscode.window.showWarningMessage(
      'WitcherScript language server not found. Set witcherscript.server.path or reinstall the extension with the bundled server.'
    );
    return;
  }

  const serverOptions = {
    command: serverPath,
    transport: TransportKind.stdio
  };
  const outputChannel = vscode.window.createOutputChannel('WitcherScript');
  context.subscriptions.push(outputChannel);

  const clientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'witcherscript' },
      { scheme: 'untitled', language: 'witcherscript' }
    ],
    synchronize: {
      configurationSection: 'witcherscript'
    },
    initializationOptions: {
      gameDirectory: resolveGameDirectory(outputChannel),
      logLevel: vscode.workspace.getConfiguration('witcherscript').get('logLevel') ?? 'warn',
      formatter: {
        lineLimit: vscode.workspace.getConfiguration('witcherscript').get('formatter.lineLimit') ?? 100,
        compactColon: vscode.workspace.getConfiguration('witcherscript').get('formatter.compactColon') ?? false
      }
    },
    outputChannel
  };

  client = new LanguageClient(
    'witcherscriptLanguageServer',
    'WitcherScript Language Server',
    serverOptions,
    clientOptions
  );
  context.subscriptions.push(client);
  client.start();
}

function deactivate() {
  if (!client) {
    return undefined;
  }

  return client.stop();
}

function resolveGameDirectory(outputChannel) {
  const configured = vscode.workspace
    .getConfiguration('witcherscript')
    .get('gameDirectory');
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

function detectGogGameDirectory() {
  const key = 'HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\1495134320';
  try {
    const output = execSync(`reg query "${key}" /v path`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const match = output.match(/^\s*path\s+REG_SZ\s+(.+?)\s*$/m);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

function resolveServerPath(context) {
  const configuredPath = vscode.workspace
    .getConfiguration('witcherscript')
    .get('server.path');
  if (configuredPath && fs.existsSync(configuredPath)) {
    return configuredPath;
  }

  const executable = process.platform === 'win32' ? 'witcherscript-lsp.exe' : 'witcherscript-lsp';
  const candidates = [
    context.asAbsolutePath(path.join('server', executable))
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

module.exports = {
  activate,
  deactivate
};
