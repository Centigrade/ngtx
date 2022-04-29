import { SpyFactoryFn } from './types';
import { tryInitChalk } from './utility/print-dom';

export const NGTX_GLOBAL_CONFIG: NgtxGlobalConfig = {
  defaultSpyFactory: (returnValue?: any): any => {
    throw new Error(
      `No spy-factory passed to ngtx. Please call useFixture(fixture, { spyFactory: () => <spyInstance> })`,
    );
  },
};

/**
 * Enables syntax highlighting of ngtx's `debug` feature in terminals that supports colors.
 * Without it, the debug feature will only output the text in plain, white color.
 */
export async function initSyntaxHighlighting(): Promise<void> {
  await tryInitChalk();
}

/**
 * Configures ngtx to use the specified spyFactory as default whenever a declarative test needs to
 * create a spy.
 * @param spyFactory The spy factory to automatically use when spies are needed in declarative tests.
 */
export function setDefaultSpyFactory(spyFactory: SpyFactoryFn): void {
  NGTX_GLOBAL_CONFIG.defaultSpyFactory = spyFactory;
}

// ------------------------------
// Module internals
// ------------------------------
interface NgtxGlobalConfig {
  defaultSpyFactory: SpyFactoryFn;
}
