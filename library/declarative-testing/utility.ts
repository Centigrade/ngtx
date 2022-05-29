import { NgtxElement, NgtxMultiElement } from '../entities';
import { NgtxEmptySet } from './constants';
import { MultiPartRef, TargetRef } from './types';

export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
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

export function asMultiElement<Html extends HTMLElement, Type>(
  value: TargetRef<Html, Type>,
): NgtxMultiElement<Html, Type> {
  const element = isMultiPartRef(value)
    ? value()
    : new NgtxMultiElement([value() as NgtxElement<Html, Type>]);

  return element;
}

export function isMultiPartRef(
  value: any,
): value is MultiPartRef<HTMLElement, unknown> {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  const target = value();
  const isDefined = target != null;
  const isEmptySet = target === NgtxEmptySet;
  return isDefined && (isEmptySet || typeof target.unwrap === 'function');
}
