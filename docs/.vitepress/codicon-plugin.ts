import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type StateCore from "markdown-it/lib/rules_core/state_core.mjs";

export function codiconPlugin(md: MarkdownIt): void {
  md.core.ruler.push("codicons", transformCodicons);
}

function transformCodicons(state: StateCore): void {
  for (const blockToken of state.tokens) {
    if (blockToken.type !== "inline" || !blockToken.children) continue;
    blockToken.children = expandCodiconTokens(state, blockToken.children);
  }
}

const CODICON_RE = /(\$\([a-z][a-z0-9-]*(?:~[a-z]+)?\))/g;

function expandCodiconTokens(state: StateCore, tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (const token of tokens) {
    if (token.type !== "text") {
      result.push(token);
      continue;
    }

    const parts = token.content.split(CODICON_RE);

    if (parts.length === 1) {
      result.push(token);
      continue;
    }

    for (const part of parts) {
      const match = part.match(/^\$\(([a-z][a-z0-9-]*)(?:~([a-z]+))?\)$/);

      if (match) {
        const [, iconName, modifier] = match;
        const classes = ["codicon", `codicon-${iconName}`];
        if (modifier === "spin") classes.push("codicon-modifier-spin");

        const html = new state.Token("html_inline", "", 0);
        html.content = `<span class="${classes.join(" ")}" aria-hidden="true"></span>`;
        result.push(html);
      } else if (part) {
        const text = new state.Token("text", "", 0);
        text.content = part;
        result.push(text);
      }
    }
  }

  return result;
}
