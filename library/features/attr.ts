import { ComponentFixture } from '@angular/core/testing';
import { isNativeElement } from '../type-guards';
import { Fn, QueryTarget } from '../types';
import { convert, resolveDebugElement } from '../utility';

export function attrImpl<Html extends HTMLElement, Component>(
  fixture: ComponentFixture<any>,
  name: string,
  queryTarget: QueryTarget<Component, Html> | HTMLElement,
): string;
export function attrImpl<Html extends HTMLElement, Component, Out>(
  fixture: ComponentFixture<any>,
  name: string,
  queryTarget: QueryTarget<Component, Html> | HTMLElement,
  converterFn: Fn<string, Out>,
): Out;
export function attrImpl<Html extends HTMLElement, Component, Out>(
  fixture: ComponentFixture<any>,
  name: string,
  queryTarget: QueryTarget<Component, Html> | HTMLElement,
  converterFn?: Fn<string, Out>,
): string | Out {
  const nativeElement = isNativeElement(queryTarget)
    ? queryTarget
    : resolveDebugElement(queryTarget, fixture)?.nativeElement;

  if (!nativeElement) {
    return null;
  }

  const attrValue = nativeElement.getAttribute(name);
  return convert(attrValue, converterFn);
}
