const fs = require('fs');
const path = require('path');
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
  const clientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'witcherscript' },
      { scheme: 'untitled', language: 'witcherscript' }
    ],
    synchronize: {
      configurationSection: 'witcherscript'
    },
    initializationOptions: {
      gameDirectory: vscode.workspace.getConfiguration('witcherscript').get('gameDirectory') ?? ''
    }
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
