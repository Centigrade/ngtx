import { NgtxGlobalConfig, SpyFactoryFn } from './types';

const NO_FRAMEWORK_ADAPTER_ERROR = () => {
  throw new Error(
    `No testingFrameworkAdapter was configured for ngtx scenario testing. Please call "configureNgtx(config)" and pass a testingFrameworkAdapter. For help, see: https://github.com/Centigrade/ngtx/blob/main/docs/configuring-ngtx.md`,
  );
};

const DEFAULT_TESTING_FRAMEWORK_ADAPTER = {
  describe: NO_FRAMEWORK_ADAPTER_ERROR,
  fdescribe: NO_FRAMEWORK_ADAPTER_ERROR,
  beforeEach: NO_FRAMEWORK_ADAPTER_ERROR,
};

export const NGTX_GLOBAL_CONFIG: NgtxGlobalConfig = {
  testingFrameworkAdapter: DEFAULT_TESTING_FRAMEWORK_ADAPTER,
  defaultSpyFactory: (returnValue?: any): any => {
    throw new Error(
      `No spy-factory passed to ngtx. Please call useFixture(fixture, { spyFactory: () => <spyInstance> }). Or setup a default spy-factory via "setDefaultSpyFactory"-function imported from "@centigrade/ngtx".`,
    );
  },
};

/** Configures ngtx in order to make it work with your current test setup. */
export function configureNgtx(config: NgtxGlobalConfig) {
  NGTX_GLOBAL_CONFIG.defaultSpyFactory = config.defaultSpyFactory;
  NGTX_GLOBAL_CONFIG.testingFrameworkAdapter =
    config.testingFrameworkAdapter ?? DEFAULT_TESTING_FRAMEWORK_ADAPTER;
}

/**
 * Configures ngtx to use the specified spyFactory as default whenever a declarative test needs to
 * create a spy.
 * @param spyFactory The spy factory to automatically use when spies are needed in declarative tests.
 * @deprecated Please use `configureNgtx(config)` instead. This function will be removed in ngtx 3.
 * @todo To be removed in ngtx version 3.
 */
export function setDefaultSpyFactory(spyFactory: SpyFactoryFn): void {
  NGTX_GLOBAL_CONFIG.defaultSpyFactory = spyFactory;
}
