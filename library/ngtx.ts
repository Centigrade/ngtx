import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxFixture } from './entities';

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
export function ngtx(suite: (features: NgtxFixture & NgtxElement) => void) {
  const ngtxFixture = new NgtxFixture();
  const root: NgtxElement = new NgtxElement();

  return () =>
    suite({
      useFixture: (<T>(fixture: ComponentFixture<T>) => {
        root.debugElement = ngtxFixture.useFixture(fixture);
      }) as any,
      detectChanges: ngtxFixture.detectChanges.bind(ngtxFixture),
      debug: root.debug.bind(ngtxFixture),
      get: root.get.bind(root),
      getAll: root.getAll.bind(root),
      attr: root.attr.bind(root),
      triggerEvent: root.triggerEvent.bind(root),
      textContent: root.textContent.bind(root),
    } as NgtxFixture & NgtxElement);
}
