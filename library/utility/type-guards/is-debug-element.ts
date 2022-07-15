import { DebugElement } from '@angular/core';

/**
 * Checks whether a given value is a `DebugElement`.
 * @param value The value to check if it is a `DebugElement`.
 */
export function isDebugElement<Html extends HTMLElement, Component>(
  value: any,
): value is DebugElement {
  // TODO: langju: maybe find better way to distinguish
  return (
    typeof value.queryAllNodes === 'function' &&
    typeof value.triggerEventHandler === 'function'
  );
}
