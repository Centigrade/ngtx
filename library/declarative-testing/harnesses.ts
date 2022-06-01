import { Type } from '@angular/core';
import { NgtxFixture } from '../entities';
import { QueryTarget } from '../types';

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
) {
  return (nth?: number) => {
    return nth != null
      ? () => getAll(target as Type<T>).nth(nth)
      : () => getAll(target as Type<T>);
  };
}
