/**
 * Returns the given string value as its `boolean` representation.
 *
 * ---
 * **Example:**
 * ~~~ts
 * const trueStr = 'true';
 * const number = 1;
 * const falseStr = 'false';
 * const notDefined = undefined;
 * asBool(trueStr); // => true
 * asBool(number); // => false
 * asBool(falseStr); // => false
 * asBool(notDefined); // => false
 * ~~~
 * ---
 * @param value The string value to be converted into a boolean.
 */
export function asBool(value: string) {
  return value === 'true' ? true : false;
}
