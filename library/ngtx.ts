import { ComponentFixture } from '@angular/core/testing';
import { NgtxFixture } from './entities';
import { EffectApi, WhenInit } from './entities/effect-testing';
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
      useFixture: <T>(fixture: ComponentFixture<T>): NgtxFixture<T> => {
        return ngtxFixture.useFixture(fixture) as NgtxFixture<T>;
      },
      componentInstance: ngtxFixture.componentInstance,
      nativeElement: ngtxFixture.nativeElement,
      createEffectTestingApi<Component>(
        fixture: NgtxFixture<Component>,
        spyFactory: () => any,
      ): EffectApi<Component> {
        return WhenInit(fixture, spyFactory);
      },
      detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
      get: ngtxFixture.get.bind(ngtxFixture),
      getAll: ngtxFixture.getAll.bind(ngtxFixture),
      triggerEvent: ngtxFixture.triggerEvent.bind(ngtxFixture),
    });
}
