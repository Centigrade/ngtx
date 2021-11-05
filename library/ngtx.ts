import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxRootElement } from './library';

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
export function ngtx(suite: (features: NgtxRootElement & NgtxElement) => void) {
  const root = new NgtxRootElement();
  let current: NgtxElement = new NgtxElement();

  return () =>
    suite({
      useFixture: (<T>(fixture: ComponentFixture<T>) => {
        current.debugElement = root.useFixture(fixture);
      }) as any,
      detectChanges: root.detectChanges.bind(root),
      debug: root.debug.bind(root),
      get: current.get.bind(current),
      getAll: current.getAll.bind(current),
      attr: current.attr.bind(current),
      triggerEvent: current.triggerEvent.bind(current),
      textContent: current.textContent.bind(current),
    } as NgtxRootElement & NgtxElement);
}
