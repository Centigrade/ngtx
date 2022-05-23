import { NgtxElement, NgtxMultiElement } from '../entities';
import { MultiPartRef, PartRef } from './types';

export function resolveRef<Html extends HTMLElement, Type>(
  ref: MultiPartRef<Html, Type>,
): NgtxMultiElement<Html, Type>;
export function resolveRef<Html extends HTMLElement, Type>(
  ref: PartRef<Html, Type>,
): NgtxElement<Html, Type>;
export function resolveRef<Html extends HTMLElement, Type>(
  ref: PartRef<Html, Type> | MultiPartRef<Html, Type>,
): NgtxElement<Html, Type> | NgtxMultiElement<Html, Type> {
  return ref();
}

export function isMultiElementRef(
  value: any,
): value is NgtxMultiElement<HTMLElement, unknown> {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  const target = value();
  return target != null && typeof target.unwrap === 'function';
}
