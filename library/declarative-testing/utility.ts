import { NgtxElement, NgtxMultiElement } from '../core';
import { isTargetFound } from '../utility';
import { ElementList, ElementListRef, TargetRef } from './types';

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
