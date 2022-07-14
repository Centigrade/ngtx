import { NgtxElement, NgtxMultiElement } from '../core';
import { isTargetFound } from '../utility';
import { ElementList, ElementListRef, TargetRef } from './types';

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Takes a value and checks if it is already an array of the desired length. If it is, is simply returns it unmodified.
 * If it is no array, but a single value, the function will turn it into an array with the desired length,
 * filled with copies of the single value.
 *
 * If it is an array, but not matching the desired length, and having more than one item in it, this function will throw,
 * as this indicates that the user made some error regarding their expectation of the test-state.
 *
 * @param length The array length that is the desired length for the output-array.
 * @param value The value, possibly already an array, that should be transformed into an array with the desired len gth.
 * @returns An array with the desired length, containing the original values (if they matched the length beforehand) or an array containing the copy of the single value the desired-length-times.
 */
export function expandValueToArrayWithLength<T>(
  length: number,
  value: T | T[],
): T[] {
  const array = asArray(value);

  // checking more items than ngtx could find -> error
  if (array.length > length) {
    throw new Error(
      `The given array's length (${array}.length == ${array.length}) is greater than the number of found elements!`,
    );
  }
  // length is already ok -> return
  if (array.length === length) {
    return array;
  }
  // only one item was given -> expand it to match the number of found elements -> return
  if (array.length === 1) {
    return new Array(length).fill(array[0]);
  }

  // throw as too few checks (but more than one) was given. It seems like the user thought there would be fewer items than it actually is.
  throw new Error(
    `The number of given checks (${array.length}) does not match with the number of found elements (${length})`,
  );
}

export function tryResolveTarget<Html extends HTMLElement, Type>(
  targets: ElementListRef<Html, Type>,
  callerName: string,
) {
  const resolved = targets();

  if (!isTargetFound(resolved)) {
    throw new Error(
      `[${callerName}] Expected the target "${targets.name}" to exist, but it wasn't found.`,
    );
  }

  return resolved;
}

export function asElementList<Html extends HTMLElement, Type>(
  value: NgtxElement<Html, Type> | NgtxMultiElement<Html, Type>,
): ElementList<Html, Type> {
  const elements = value instanceof NgtxMultiElement ? value.unwrap() : [value];
  return elements;
}

export function asNgtxElementListRef<Html extends HTMLElement, Type>(
  target: TargetRef<Html, Type>,
): ElementListRef<Html, Type> {
  // hint: need to dynamically create function via object [nameVar]: () => {} syntax
  // in order to "copy" the name of target as name of the wrapping function.
  // overriding fn.toString() did not work for some reason, so this was the only way
  // to apply the target.name to our wrapping function:
  const fnName = target.name;
  return {
    [fnName]: (): ElementList<Html, Type> => {
      const targets = target();
      return isTargetFound(targets) ? asElementList(targets) : null!;
    },
  }[fnName];
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

export function fnWithName<T extends (...args: unknown[]) => unknown>(
  name: string,
  original: T,
): T {
  original.toString = () => name;
  return original;
}
