export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function checkListsHaveSameSize(
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

export function scheduleFn(
  fnArray: undefined | (() => void)[],
  fn: () => void,
): (() => void)[] {
  if (fnArray == null) {
    return [fn];
  }

  return [...fnArray, fn];
}
