import { TypedDebugElement } from '../types';

/**
 * Checks whether a given value is a `DebugElement`.
 * @param value The value to check if it is a `DebugElement`.
 */
export function isDebugElement<Html, Component>(
  value: any,
): value is TypedDebugElement<Component, Html> {
  // TODO: langju: maybe find better way to distinguish
  return (
    typeof value.queryAllNodes === 'function' &&
    typeof value.triggerEventHandler === 'function'
  );
}
