import { NgtxList } from './types';

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function removeNullAndUndefined<T>(
  array: (T | null | undefined)[],
): T[] {
  return array.filter((item) => item != null) as T[];
}

export function checkAssertionsCountMatchesFoundElementCount(
  fnName: string,
  expectations: { length: number },
  matches: { length: number },
) {
  if (expectations.length !== matches.length) {
    throw new Error(
      `ngtx [${fnName}]: The number of defined states (${
        expectations.length
      }) does not match the number of found elements in DOM (${
        matches.length ?? 0
      }). Please ensure that you describe all elements of your query.`,
    );
  }
}

export function createList<T>(value: T | T[]): NgtxList<T> {
  const array = removeNullAndUndefined(asArray(value));
  return Object.assign(array, {
    nth: (pos: number) => array[pos - 1],
    first: () => array[0],
    last: () => array[array.length - 1],
  });
}

export function scheduleFn(
  fnArray: undefined | (() => void)[],
  fn: () => void,
): (() => void)[] {
  if (fnArray == null) {
    return [fn];
  }

  return [...fnArray, fn];
}
