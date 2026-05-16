import * as vscode from "vscode";
import { LanguageClient, State } from "vscode-languageclient/node";

const BUILTIN_SCHEME = "witcherscript-builtin";

const cache = new Map<string, string>();
const pendingUris = new Set<string>();
const onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
let activeClient: LanguageClient | undefined;
let stateListener: vscode.Disposable | undefined;
let outputChannel: vscode.LogOutputChannel;

export function registerBuiltinContentProvider(
  context: vscode.ExtensionContext,
  channel: vscode.LogOutputChannel,
): void {
  outputChannel = channel;
  const provider: vscode.TextDocumentContentProvider = {
    onDidChange: onDidChangeEmitter.event,
    provideTextDocumentContent: provideBuiltinSource,
  };
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(BUILTIN_SCHEME, provider),
    onDidChangeEmitter,
  );
}

export function setBuiltinClient(client: LanguageClient | undefined): void {
  if (client === activeClient) return;
  activeClient = client;
  cache.clear();
  stateListener?.dispose();
  stateListener = undefined;
  if (!client) return;
  stateListener = client.onDidChangeState(({ newState }) => {
    if (newState === State.Running) refreshPendingUris();
    else if (newState === State.Stopped) cache.clear();
  });
}

async function provideBuiltinSource(uri: vscode.Uri): Promise<string> {
  const key = uri.toString();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  if (!activeClient || activeClient.state !== State.Running) {
    pendingUris.add(key);
    return "";
  }
  return await fetchBuiltinSource(uri, activeClient);
}

async function fetchBuiltinSource(uri: vscode.Uri, client: LanguageClient): Promise<string> {
  const key = uri.toString();
  try {
    outputChannel.trace(`Fetching built-in source for ${key}.`);
    const response = await client.sendRequest<{ text: string } | null>(
      "witcherscript/builtinSource",
      { uri: key },
    );
    const text = response?.text ?? "";
    cache.set(key, text);
    pendingUris.delete(key);
    return text;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    outputChannel.warn(`Failed to fetch built-in source for ${key}: ${message}`);
    pendingUris.add(key);
    return "";
  }
}

function refreshPendingUris(): void {
  if (pendingUris.size === 0) return;
  const uris = Array.from(pendingUris);
  pendingUris.clear();
  for (const uri of uris) {
    onDidChangeEmitter.fire(vscode.Uri.parse(uri));
  }
}
