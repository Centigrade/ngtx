import { ComponentFixture } from '@angular/core/testing';
import { DeclarativeTestingApi } from './declarative-testing/api';
import { createDeclarativeTestingApi } from './declarative-testing/declarative-testing';
import { NgtxElement, NgtxFixture } from './entities';
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
  const When = createDeclarativeTestingApi(ngtxFixture);

  return () =>
    suite({
      useFixture: <Html extends HTMLElement = HTMLElement, T = any>(
        fixture: ComponentFixture<T>,
        opts: UseFixtureOptions | boolean = {},
      ): NgtxFixture<Html, T> => {
        const options: UseFixtureOptions =
          typeof opts === 'boolean'
            ? { skipInitialChangeDetection: opts }
            : opts;

        if (options.spyFactory) {
          When.setSpyFactory(options.spyFactory);
        }

        return ngtxFixture.useFixture(
          fixture,
          options.skipInitialChangeDetection,
        ) as NgtxFixture<Html, T>;
      },
      When: When as DeclarativeTestingApi,
      host: () => ngtxFixture.rootElement as NgtxElement<HTMLElement, T>,
      detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
      get: ngtxFixture.get.bind(ngtxFixture),
      getAll: ngtxFixture.getAll.bind(ngtxFixture),
      triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
    });
}
