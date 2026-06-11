import * as vscode from "vscode";
import { displayName, extensionId, name } from "./generated-meta";

/** Mirrors the values of VS Code's `editor.inlayHints.enabled` setting. */
export type InlayHintsMode = "on" | "onUnlessPressed" | "offUnlessPressed" | "off";

const INLAY_HINTS_SETTING = "inlayHints.enabled";
const INLAY_HINTS_MODE_KEY = `${name}.inlayHintsMode`;
const NOTICE_SEEN_KEY = `${name}.inlayHintsNotice.seen`;

const WALKTHROUGH_CATEGORY = `${extensionId}#${name}.gettingStarted`;
const WALKTHROUGH_STEP = "inlayHints";

/** Reads the `[witcherscript]`-scoped value; VS Code defaults to `on` when unset. */
function readInlayHintsMode(): InlayHintsMode {
  return vscode.workspace
    .getConfiguration("editor", { languageId: name })
    .get<InlayHintsMode>(INLAY_HINTS_SETTING, "on");
}

/**
 * Writes the editor setting scoped to the `[witcherscript]` language so other
 * languages keep their own inlay-hint preference. Global target: it's an editor
 * preference, not per-workspace.
 */
export async function setInlayHintsMode(mode: InlayHintsMode): Promise<void> {
  await vscode.workspace
    .getConfiguration("editor", { languageId: name })
    .update(INLAY_HINTS_SETTING, mode, vscode.ConfigurationTarget.Global, true);
}

function applySetting(): void {
  // Command required during sync startup; intentionally discarded
  vscode.commands.executeCommand("setContext", INLAY_HINTS_MODE_KEY, readInlayHintsMode());
}

/**
 * Publishes the current mode as a context key so the walkthrough tiles can show
 * which one is active; `config.*` when-clause keys can't read a language-scoped
 * value.
 */
export function registerInlayHintsContextKey(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(`editor.${INLAY_HINTS_SETTING}`)) {
        applySetting();
      }
    }),
  );

  applySetting();
}

/**
 * One-time upgrade notice that `.ws` files now show inlay hints. Shown once per user
 * (synced flag). Fresh installs are shown the walkthrough, instead.
 */
export async function maybeShowInlayHintsNotice(
  context: vscode.ExtensionContext,
  channel: vscode.LogOutputChannel,
  isFreshInstall: boolean,
): Promise<void> {
  context.globalState.setKeysForSync([NOTICE_SEEN_KEY]);
  if (context.globalState.get<boolean>(NOTICE_SEEN_KEY)) return;

  if (isFreshInstall) {
    channel.trace("Inlay-hints notice suppressed: fresh install.");
    await context.globalState.update(NOTICE_SEEN_KEY, true);
    return;
  }

  await presentInlayHintsNotice(context, channel);
}

const SHOW_ME = "Show me";
const OFF_UNLESS_PRESSED = "Off unless pressed";
const OK = "OK";

async function presentInlayHintsNotice(
  context: vscode.ExtensionContext,
  channel: vscode.LogOutputChannel,
): Promise<void> {
  const choice = await vscode.window.showInformationMessage(
    `${displayName} now shows inlay hints in .ws files, but by default VS Code will always show them.\nRecommended: "Off unless pressed"`,
    SHOW_ME,
    OFF_UNLESS_PRESSED,
    OK,
  );

  // Ensure the user has actually seen the notice before marking it as seen
  await context.globalState.update(NOTICE_SEEN_KEY, true);

  if (choice === SHOW_ME) {
    await vscode.commands.executeCommand(
      "workbench.action.openWalkthrough",
      { category: WALKTHROUGH_CATEGORY, step: WALKTHROUGH_STEP },
      false,
    );
    return;
  }

  if (choice === OFF_UNLESS_PRESSED) {
    await setInlayHintsMode("offUnlessPressed");
    channel.debug("Inlay hints set to offUnlessPressed for witcherscript from notice.");
  }
}
