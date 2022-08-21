import { NgtxGlobalConfig, SpyFactoryFn } from './types';

export const NGTX_GLOBAL_CONFIG: NgtxGlobalConfig = {
  defaultSpyFactory: (returnValue?: any): any => {
    throw new Error(
      `No spy-factory passed to ngtx. Please call useFixture(fixture, { spyFactory: () => <spyInstance> }). Or setup a default spy-factory via "setDefaultSpyFactory"-function imported from "@centigrade/ngtx".`,
    );
  },
};

/**
 * Configures ngtx to use the specified spyFactory as default whenever a declarative test needs to
 * create a spy.
 * @param spyFactory The spy factory to automatically use when spies are needed in declarative tests.
 */
export function setDefaultSpyFactory(spyFactory: SpyFactoryFn): void {
  NGTX_GLOBAL_CONFIG.defaultSpyFactory = spyFactory;
}
