import { Type } from '@angular/core';
import { NgtxElement, NgtxFixture } from '../core';
import { QueryTarget } from '../types';
import { NgtxElementRef, NgtxMultiElementRef, TargetRef } from './types';

/**
 * Creates a harness query that either returns all instances of a given query-target,
 * or the nth finding of it (if you call `.nth()` on it).
 *
 * **Example:**
 *
 * ~~~ts
 * ngtx(({ getAll }) => {
 *   class the {
 *     static DropDownItems = allOrNth(DropDownItemComponent, getAll);
 *     static Actions = allOrNth('.action-btn', getAll);
 *   }
 * });
 * ~~~
 * and then use this testing-harness:
 * ~~~ts
 * When(the.DropDownItems.nth(2)) // returns the second item
 *   .gets(clicked)
 *   .expect(the.Actions) // returns all actions
 *   .to(beFound({ times: 3 }));
 * ~~~
 *
 * @param target The query-target to search for.
 * @param getAll The getAll function from your ngtx test-env.
 * @returns A function that either finds and returns all instances of a query-target, or - if specified - a wanted item of the found instances.
 */
export function allOrNth<Html extends HTMLElement, T = any>(
  target: QueryTarget<T> | QueryTarget<T>[],
  getAll: NgtxFixture<Html, T>['getAll'],
): AllOrNthTarget<Html, T> {
  const allOrNthQuery: NgtxMultiElementRef<Html, T> = () => {
    return getAll<Html, T>(target as Type<T>);
  };

  return Object.assign(allOrNthQuery, {
    nth: (nth: number) => () => {
      return allOrNthQuery().nth(nth);
    },
    first: () => allOrNthQuery().first(),
    last: () => allOrNthQuery().last(),
    find: (predicate: PredicateFn<Html, T>) => {
      return () => allOrNthQuery().unwrap().find(predicate);
    },
    atIndex: (index: number) =>
      (() => {
        return allOrNthQuery().atIndex(index);
      }) as TargetRef<Html, T>,
  }) as AllOrNthTarget<Html, T>;
}

// ----------------------------
// internal module types
// ----------------------------
type PredicateFn<Html extends HTMLElement, T> = (
  item: NgtxElement<Html, T>,
  index: number,
  matches: NgtxElement<Html, T>[],
) => boolean;

type AllOrNthTarget<Html extends HTMLElement, T> = NgtxMultiElementRef<
  Html,
  T
> & {
  nth(pos: number): NgtxElementRef<Html, T>;
  first: NgtxElementRef<Html, T>;
  last: NgtxElementRef<Html, T>;
  atIndex(index: number): NgtxElementRef<Html, T>;
  find(predicate: PredicateFn<Html, T>): NgtxElementRef<Html, T>;
};
