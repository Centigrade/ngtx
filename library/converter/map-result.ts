import { TypedDebugElement } from '../types';

/**
 * Maps each DebugElement to the expression returned by the mapper function.
 *
 * **Example**
 * ~~~ts
 * const cssClasses =
 *   findAll('button', mapResult<HTMLButtonElement>(
 *     (debugElement) => debugElement.nativeElement.classList),
 *   );
 * ~~~
 * @param mapperFn A function that does the mapping for each `DebugElement`.
 */
export const mapResult = <Html extends HTMLElement, Component, Out>(
  mapperFn: (arg: TypedDebugElement<Component, Html>) => Out,
) => {
  return (debugElements: TypedDebugElement<Component, Html>[]) =>
    debugElements.map(mapperFn);
};
