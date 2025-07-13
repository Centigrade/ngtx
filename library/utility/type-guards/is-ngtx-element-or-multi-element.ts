import { NgtxElement, NgtxMultiElement } from '../../core';
import { NgtxElementSymbol } from '../../core/symbols';

export function isNgtxElementOrMultiElement(
  value: any,
): value is NgtxElement | NgtxMultiElement {
  if (value == undefined) return false;
  return value[NgtxElementSymbol] === true;
}
