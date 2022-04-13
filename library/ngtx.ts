import { ComponentFixture } from '@angular/core/testing';
import { NgtxFixture } from './entities';
import { EffectTestingApi, When } from './entities/effect-testing';
import { NgtxSuite } from './types';

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
export function ngtx(suite: (ngtx: NgtxSuite) => void) {
  const ngtxFixture = new NgtxFixture();

  return () =>
    suite({
      useFixture: <Html extends Element = Element, T = any>(
        fixture: ComponentFixture<T>,
      ): NgtxFixture<Html, T> => {
        return ngtxFixture.useFixture(fixture) as NgtxFixture<Html, T>;
      },
      createEffectTestingApi<Html extends Element, Component>(
        fixture: NgtxFixture<Html, Component>,
        spyFactory: () => any,
      ): EffectTestingApi<Component> {
        return When(fixture, spyFactory);
      },
      detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
      get: ngtxFixture.get.bind(ngtxFixture),
      getAll: ngtxFixture.getAll.bind(ngtxFixture),
      triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
    });
}
