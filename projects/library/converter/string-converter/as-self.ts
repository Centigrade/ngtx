/**
 * Returns the given string value without modifications.
 *
 * ---
 * **Example:**
 * ~~~ts
 * const original = 'some string';
 * const result = asSelf(original); // => 'some string'
 * ~~~
 * ---
 * @param value The string value to be returned.
 */
export function asSelf(value: string): string {
  return value;
}
