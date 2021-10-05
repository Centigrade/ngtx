import { ComponentFixture } from '@angular/core/testing';
import { attrImpl } from './features/attr';
import { debugImpl } from './features/debug';
import { detectChangesImpl } from './features/detect-changes';
import { findImpl } from './features/find';
import { findAllImpl } from './features/find-all';
import { findWhereImpl } from './features/find-where';
import { textContentImpl } from './features/text-content';
import { triggerEventImpl } from './features/trigger-event';
import { Fn, LifeCycleHooks, QueryTarget, TypedDebugElement } from './types';
import { Ngtx } from './types/ngtx';
import { TypeObjectMap } from './types/typed-object-map';

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
  let fixture: ComponentFixture<any>;

  function debug<Component, Html extends HTMLElement>(
    root?: QueryTarget<Component, Html>,
  ): void {
    debugImpl(fixture, root);
  }

  function detectChanges<T extends LifeCycleHooks>(
    component?: T,
    changes?: TypeObjectMap<T>,
  ): void {
    return detectChangesImpl(fixture, component, changes);
  }

  function find<Html extends HTMLElement, Component, Out>(
    query: QueryTarget<Component, Html>,
    accessor?: Fn<TypedDebugElement<Component, Html>, Out>,
  ): TypedDebugElement<Component, Html> | Out {
    return findImpl(fixture, query, accessor);
  }

  function findAll<Html extends HTMLElement, Component, Out>(
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    accessor?: Fn<TypedDebugElement<Component, Html>[], Out[]>,
  ): TypedDebugElement<Component, Html>[] | Out[] {
    return findAllImpl(fixture, queryTarget, accessor);
  }

  function findWhere<Html extends HTMLElement, Component, Out>(
    condition: Fn<TypedDebugElement<Component, Html>, boolean>,
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    converter?: Fn<TypedDebugElement<Component, Html>, Out>,
  ): TypedDebugElement<Component, Html> | Out {
    const results: TypedDebugElement<Component, Html>[] = findAll<
      Html,
      Component,
      never
    >(queryTarget);
    return findWhereImpl(fixture, condition, queryTarget, converter);
  }

  function attr<Html extends HTMLElement, Component>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string;
  function attr<Html extends HTMLElement, Component, Out>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
    convert: Fn<string, Out>,
  ): Out;
  function attr<Html extends HTMLElement, Component, Out>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
    converterFn?: Fn<string, Out>,
  ): string | Out {
    return attrImpl(fixture, name, queryTarget, converterFn);
  }

  function triggerEvent<Html extends HTMLElement, Component>(
    eventName: string,
    queryTarget: QueryTarget<Component, Html>,
    eventNameArgs?: any,
  ): void {
    return triggerEventImpl(fixture, eventName, queryTarget, eventNameArgs);
  }

  function textContent<Html extends HTMLElement, Component>(
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string | null {
    return textContentImpl(fixture, queryTarget);
  }

  return () =>
    suite({
      useFixture: (newFixture) => {
        fixture = newFixture;
        fixture.detectChanges();
      },
      detectChanges,
      find,
      findAll,
      findWhere,
      attr,
      triggerEvent,
      textContent,
      debug,
    });
}
