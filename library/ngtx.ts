import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxFixture } from './core';
import { createDeclarativeTestingApi } from './declarative-testing/declarative-testing';
import {
  NgtxScenarioSetupFnMarker,
  NgtxScenarioViewSetupFnMarker,
} from './scenario-testing/symbols';
import {
  ComponentFixtureRef,
  NgtxScenarioTestAssertionFn,
  ScenarioSetupFn,
  ScenarioViewSetupFn,
} from './scenario-testing/types';
import { NgtxSuite, UseFixtureOptions } from './types';

/**
 * Injects ngtx test features into the given test suite.
 *
 * ---
 * **Example:**
 * ~~~ts
 * describe('MyTestSuite',
 *   ngtx(({ useFixture }) => {
 *      beforeEach(() => {
 *        // ...
 *        useFixture(fixture);
 *      });
 *   });
 * );
 * ~~~~
 * ---
 * To get more help please consult the documentation: https://github.com/Centigrade/ngtx
 *
 * ---
 * @param suite The test suite to be enriched with ngtx helper features.
 */
function _ngtx<T = any>(suite: (ngtx: NgtxSuite<T>) => void) {
  const ngtxFixture = new NgtxFixture();
  const When = createDeclarativeTestingApi(ngtxFixture);

  const ngtxImpl = {
    useFixture: <Html extends HTMLElement = HTMLElement, T = any>(
      fixture: ComponentFixture<T>,
      opts: UseFixtureOptions | boolean = {},
    ): NgtxFixture<Html, T> => {
      const options: UseFixtureOptions =
        typeof opts === 'boolean' ? { skipInitialChangeDetection: opts } : opts;

      if (options.spyFactory) {
        When.setSpyFactory(options.spyFactory);
      }

      return ngtxFixture.useFixture(
        fixture,
        options.skipInitialChangeDetection,
      ) as NgtxFixture<Html, T>;
    },
    When,
    host: () => ngtxFixture.rootElement as NgtxElement<HTMLElement, T>,
    detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
    get: ngtxFixture.get.bind(ngtxFixture),
    getAll: ngtxFixture.getAll.bind(ngtxFixture),
    triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
  };

  return () => suite(ngtxImpl);
}

export const ngtx = Object.assign(_ngtx, {
  scenario: {
    envSetupFn,
    viewSetupFn,
    testGeneratorFn,
  },
  is,
});

function testGeneratorFn<Html extends HTMLElement, Component>(
  fn: NgtxScenarioTestAssertionFn<Html, Component>,
) {
  return fn;
}

function envSetupFn(fn: () => unknown) {
  return Object.assign(fn, { [NgtxScenarioSetupFnMarker]: true });
}
function viewSetupFn(fn: (fixtureRef: ComponentFixtureRef) => unknown) {
  return Object.assign(fn, { [NgtxScenarioViewSetupFnMarker]: true });
}

function is(obj: any, type: 'scenarioSetupFn'): obj is ScenarioSetupFn;
function is(
  obj: any,
  type: 'scenarioViewSetupFn',
): obj is ScenarioViewSetupFn<any>;
function is(obj: any, type: 'scenarioSetupFn' | 'scenarioViewSetupFn') {
  switch (type) {
    case 'scenarioSetupFn':
      return obj?.[NgtxScenarioSetupFnMarker] === true;
    case 'scenarioViewSetupFn':
      return obj?.[NgtxScenarioViewSetupFnMarker] === true;
    default:
      return false;
  }
}
