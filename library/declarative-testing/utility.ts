import { isTargetNotFound } from '../utility';
import { TargetRef } from './types';

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function ensureArrayWithLength<T>(length: number, value: T | T[]): T[] {
  const array = asArray(value);

  if (array.length === length) {
    return array;
  }

  return new Array(length).fill(array[0]);
}

export function tryResolveTarget<Html extends HTMLElement, Type>(
  targets: TargetRef<Html, Type>,
  callerName: string,
) {
  const resolved = targets();

  if (isTargetNotFound(resolved)) {
    throw new Error(
      `[${callerName}] Expected the target "${targets.name}" to exist, but it wasn't found.`,
    );
  }

  return resolved.subjects();
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
