import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxRootElement } from './api';
import { Ngtx } from './types/ngtx';

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
export function ngtx(suite: (features: Ngtx) => void) {
  const root = new NgtxRootElement();
  let current: NgtxElement;

  return () =>
    suite({
      useFixture: <T>(fixture: ComponentFixture<T>) => {
        current = root.useFixture(fixture);
      },
      detectChanges: root.detectChanges.bind(root),
      find: current.find.bind(current),
      findAll: current.findAll.bind(current),
      attr: current.attr.bind(current),
      // TODO: langju: implement apis
      triggerEvent: null!,
      textContent: null!,
      debug: null!,
    });
}
