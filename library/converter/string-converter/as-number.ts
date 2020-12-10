/**
 * Returns the given string value as its number representation.
 *
 * ---
 * **Example:**
 * ~~~ts
 * const n = asNumber("42"); // => 42
 * ~~~
 * ---
 * @param value The value to be converted into a number.
 */
export function asNumber(value: string) {
  return Number(value);
}
