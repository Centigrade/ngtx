import { ComponentFixture } from '@angular/core/testing';
import { NgtxFixture } from './entities';
import {
  createDeclarativeTestingApi,
  DeclarativeTestingApi,
} from './features/declarative-testing';
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
        opts: UseFixtureOptions = {},
      ): NgtxFixture<Html, T> => {
        if (opts.spyFactory) {
          When.setSpyFactory(opts.spyFactory);
        }

        return ngtxFixture.useFixture(
          fixture,
          opts.skipInitialChangeDetection,
        ) as NgtxFixture<Html, T>;
      },
      When: When as DeclarativeTestingApi<T>,
      host: () => ngtxFixture.rootElement as any,
      detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
      get: ngtxFixture.get.bind(ngtxFixture),
      getAll: ngtxFixture.getAll.bind(ngtxFixture),
      triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
    });
}
