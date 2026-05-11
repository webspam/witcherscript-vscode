const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

let client;

function activate(context) {
  const serverPath = resolveServerPath(context);
  if (!serverPath) {
    vscode.window.showWarningMessage(
      'WitcherScript language server not found. Build parser with `cargo build --bin witcherscript-lsp` or set witcherscript.server.path.'
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
    context.asAbsolutePath(path.join('server', executable)),
    context.asAbsolutePath(path.join('..', 'parser', 'target', 'debug', executable)),
    context.asAbsolutePath(path.join('..', 'parser', 'target', 'release', executable))
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

module.exports = {
  activate,
  deactivate
};
