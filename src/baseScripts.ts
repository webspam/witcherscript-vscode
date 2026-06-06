import * as vscode from "vscode";
import type { ConfigurationParams, LSPAny } from "vscode-languageserver-protocol";
import { configs, scopedConfigs } from "./generated-meta";

/** Internal-only command */
export const TOGGLE_BASE_SCRIPTS_COMMAND = "witcherscript.toggleBaseScriptsDirectory";

export function isOverridingBaseScripts(): boolean {
  return getBaseScriptsDirectory().length > 0 && getUseBaseScriptsDirectory();
}

function getUseBaseScriptsDirectory(): boolean {
  return vscode.workspace
    .getConfiguration()
    .get(configs.useBaseScriptsDirectory.key, configs.useBaseScriptsDirectory.default);
}

export function getBaseScriptsDirectory(): string {
  return vscode.workspace
    .getConfiguration()
    .get(configs.baseScriptsDirectory.key, configs.baseScriptsDirectory.default);
}

export async function toggleBaseScriptsOverride(): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const target = vscode.workspace.workspaceFolders?.length
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
  await config.update(configs.useBaseScriptsDirectory.key, !getUseBaseScriptsDirectory(), target);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The server may request the single key or the whole scope object; clear the path in both cases. */
function clearBaseScriptsPath(section: string | undefined, value: LSPAny): LSPAny {
  if (section === configs.baseScriptsDirectory.key) return "";
  if (section === scopedConfigs.scope && isRecord(value)) {
    return { ...value, baseScriptsDirectory: "" };
  }
  return value;
}

/**
 * The server reads baseScriptsDirectory through workspace/configuration. When the
 * override is off, return an empty string so the server falls back to the game
 * directory; the user's saved path is left unchanged in settings. Values are
 * returned by position (one per `params.items`) so each is replaced by index.
 */
export function applyBaseScriptsOverride(params: ConfigurationParams, values: LSPAny[]): LSPAny[] {
  if (!isOverridingBaseScripts()) return values;

  const result = values.slice();
  for (let i = 0; i < params.items.length; i++) {
    result[i] = clearBaseScriptsPath(params.items[i].section, result[i]);
  }
  return result;
}
