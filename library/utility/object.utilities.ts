export function keysOf<T extends Record<string, unknown>>(
  value: T,
): (keyof T & string)[] {
  return Object.keys(value);
}
export function entriesOf<T extends Record<string, unknown>>(
  value: T,
): [keyof T & string, any][] {
  return Object.entries(value);
}
