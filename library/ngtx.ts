import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxFixture } from './core';
import { createDeclarativeTestingApi } from './declarative-testing/declarative-testing';
import { NGTX_GLOBAL_CONFIG } from './global-config';
import { ScenarioTestingEnvironment } from './scenario-testing/scenario-testing';
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
export function ngtx<T = any>(suite: (ngtx: NgtxSuite<T>) => void) {
  const ngtxFixture = new NgtxFixture();

  //#region declarative testing
  const When = createDeclarativeTestingApi(ngtxFixture);
  //#endregion

  //#region scenario testing
  const { testingFrameworkAdapter } = NGTX_GLOBAL_CONFIG;
  const scenarioTestingEnv = new ScenarioTestingEnvironment<T>(
    testingFrameworkAdapter!,
    () => ngtxFixture['fixture']!,
  );
  //#endregion

  //#region ngtx main library
  const library = {
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
    // declarative testing
    When,
    host: () => ngtxFixture.rootElement as NgtxElement<HTMLElement, T>,
    detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
    get: ngtxFixture.get.bind(ngtxFixture),
    getAll: ngtxFixture.getAll.bind(ngtxFixture),
    triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
    // scenario testing
    scenario: scenarioTestingEnv.addTestScenario.bind(scenarioTestingEnv),
  };
  //#endregion

  return () => suite(library);
}
