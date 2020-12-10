import { TypedDebugElement } from '../types';

/**
 * Converts DebugElements into NativeElements.
 *
 * ~~~ts
 * const nativeElements = findAll(ButtonComponent, toNativeElements); // => HTMLElement[]
 * ~~~
 * @param debugElements The results of a `findAll` call.
 */
export const toNativeElements = <Html extends HTMLElement, Component>(
  debugElements: TypedDebugElement<Component, Html>[],
) => debugElements.map(toNativeElement);

/**
 * Converts a DebugElement into a NativeElement.
 *
 * ~~~ts
 * const nativeElement = find(ButtonComponent, toNativeElement); // => HTMLElement;
 * ~~~
 * @param debugElement The result of a `find` call.
 */
export const toNativeElement = <Html extends HTMLElement, Component>(
  debugElement: TypedDebugElement<Component, Html>,
) => debugElement.nativeElement;
