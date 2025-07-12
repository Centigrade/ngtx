import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { configureNgtx } from './library/global-config';
import { NgtxTestingFrameworkAdapter } from './library/scenario-testing/types';

setupZoneTestEnv();

const jestFramework: NgtxTestingFrameworkAdapter = {
  describe,
  fdescribe,
  beforeEach,
};

configureNgtx({
  testingFrameworkAdapter: jestFramework,
  defaultSpyFactory: (retValue) => jest.fn(() => retValue),
  // testingModulePlugins: []
});

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
