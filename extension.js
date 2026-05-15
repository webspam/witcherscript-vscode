const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient/node');

const WALKTHROUGH_ID = 'webspam.witcherscript-language-features#witcherscript.gettingStarted';

let client;
let extensionContext;
let sharedOutputChannel;

function activate(context) {
  extensionContext = context;
  sharedOutputChannel = vscode.window.createOutputChannel('WitcherScript');
  context.subscriptions.push(sharedOutputChannel);

  context.subscriptions.push(
    vscode.commands.registerCommand('witcherscript.setGameDirectory', setGameDirectory)
  );

  startClient();
}

function deactivate() {
  if (!client) {
    return undefined;
  }

  return client.stop();
}

function startClient() {
  const serverPath = resolveServerPath(extensionContext);
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

  const gameDirectory = resolveGameDirectory(sharedOutputChannel);
  if (!gameDirectory) {
    warnMissingGameDirectory(extensionContext);
  }

  const clientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'witcherscript' },
      { scheme: 'untitled', language: 'witcherscript' }
    ],
    synchronize: {
      configurationSection: 'witcherscript'
    },
    initializationOptions: {
      gameDirectory,
      logLevel: vscode.workspace.getConfiguration('witcherscript').get('logLevel') ?? 'warn',
      formatter: {
        lineLimit: vscode.workspace.getConfiguration('witcherscript').get('formatter.lineLimit') ?? 100,
        compactColon: vscode.workspace.getConfiguration('witcherscript').get('formatter.compactColon') ?? false,
        alignMemberColons: vscode.workspace.getConfiguration('witcherscript').get('formatter.alignMemberColons') ?? false
      }
    },
    outputChannel: sharedOutputChannel
  };

  client = new LanguageClient(
    'witcherscriptLanguageServer',
    'WitcherScript Language Server',
    serverOptions,
    clientOptions
  );
  client.start();
}

async function restartClient() {
  if (client) {
    await client.stop();
    client = undefined;
  }
  startClient();
}

async function setGameDirectory() {
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Select Witcher 3 Folder',
    title: 'Select your Witcher 3 game directory'
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

function warnMissingGameDirectory(context) {
  const stateKey = 'witcherscript.missingGameDirectoryWarned';
  if (context.globalState.get(stateKey)) {
    return;
  }
  context.globalState.update(stateKey, true);

  const selectFolder = 'Select Folder';
  const openWalkthrough = 'Open Walkthrough';
  vscode.window
    .showWarningMessage(
      'WitcherScript: no game directory is set, so the language server cannot locate base game scripts. Set witcherscript.gameDirectory to the Witcher 3 install path.',
      selectFolder,
      openWalkthrough
    )
    .then((choice) => {
      if (choice === selectFolder) {
        vscode.commands.executeCommand('witcherscript.setGameDirectory');
      } else if (choice === openWalkthrough) {
        vscode.commands.executeCommand('workbench.action.openWalkthrough', WALKTHROUGH_ID);
      }
    });
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
