/**
 * Checks whether a given value is a `NativeElement`.
 * @param value The value to check if it is a `NativeElement`.
 */
export function isNativeElement(value: any): value is HTMLElement {
  // from: https://stackoverflow.com/a/384380/3063191
  const isNativeElementTypeDefined = typeof HTMLElement === 'object';

  return isNativeElementTypeDefined
    ? value instanceof HTMLElement
    : value &&
        typeof value === 'object' &&
        value !== null &&
        value.nodeType === 1 &&
        typeof value.nodeName === 'string';
}
