import { ComponentFixture } from '@angular/core/testing';
import { isNativeElement } from '../type-guards';
import { QueryTarget } from '../types';
import { printHtml, resolveDebugElement } from '../utility';

export function debugImpl<Component, Html extends HTMLElement>(
  fixture: ComponentFixture<any>,
  root?: QueryTarget<Component, Html>,
): void {
  const rootElem = root ?? fixture.nativeElement;
  const element = isNativeElement(rootElem)
    ? rootElem
    : resolveDebugElement(rootElem, fixture);
  console.log(printHtml(element));
}
