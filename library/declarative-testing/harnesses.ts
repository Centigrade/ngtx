import { Type } from '@angular/core';
import { NgtxFixture } from '../entities';
import { QueryTarget } from '../types';
import { TargetRef } from './types';

/**
 * Creates a harness query that either returns all instances of a given query-target (if no argument is given)
 * or the nth finding of it (if a position argument of type number is specified).
 *
 * Example:
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
 * When(the.DropDownItems(1)) // argument "1" given: returns the first item
 *   .gets(clicked)
 *   .expect(the.Actions()) // no arg, returns all actions
 *   .to(beFound({ times: 3 }));
 * ~~~
 *
 * @param target The query-target to search for.
 * @param getAll The getAll function from your ngtx test-env.
 * @returns A function that either finds and returns all instances of a query-target, or - if a position was given - the nth item of the found instances.
 */
export function allOrNth<Html extends HTMLElement, T = any>(
  target: QueryTarget<T>,
  getAll: NgtxFixture<Html, T>['getAll'],
): AllOrNthTarget<Html, T> {
  const doQuery = () => {
    return getAll<Html, T>(target as Type<T>);
  };

  return Object.assign(doQuery, {
    nth: (nth: number) =>
      (() => {
        return doQuery().nth(nth);
      }) as TargetRef<Html, T>,
    first: () => doQuery().first(),
    last: () => doQuery().last(),
    atIndex: (index: number) =>
      (() => {
        return doQuery().atIndex(index);
      }) as TargetRef<Html, T>,
  }) as AllOrNthTarget<Html, T>;
}

// ----------------------------
// internal module types
// ----------------------------

type AllOrNthTarget<Html extends HTMLElement, T> = TargetRef<Html, T> & {
  nth(pos: number): TargetRef<Html, T>;
  first: TargetRef<Html, T>;
  last: TargetRef<Html, T>;
  atIndex(index: number): TargetRef<Html, T>;
};
