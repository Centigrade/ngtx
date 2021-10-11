import { ComponentFixture } from '@angular/core/testing';
import { isNativeElement } from '../type-guards';
import { QueryTarget } from '../types';
import { resolveDebugElement } from '../utility';

export function textContentImpl<Html extends HTMLElement, Component>(
  fixture: ComponentFixture<any>,
  queryTarget: QueryTarget<Component, Html> | HTMLElement,
  autoTrim: boolean,
): string | null {
  const nativeElement = isNativeElement(queryTarget)
    ? queryTarget
    : resolveDebugElement(queryTarget, fixture)?.nativeElement;

  if (!nativeElement) {
    return null;
  }

  const text = nativeElement.textContent;
  return autoTrim ? text.trim() : text;
}
