import { tryInitChalk } from './print-dom';

/**
 * Enables syntax highlighting of ngtx's `debug` feature in terminals that supports colors.
 * Without it, the debug feature will only output the text in plain, white color.
 */
export async function initSyntaxHighlighting(): Promise<void> {
  await tryInitChalk();
}
