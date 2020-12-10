import { ComponentFixture } from '@angular/core/testing';
import { isNativeElement } from '../type-guards';
import { QueryTarget } from '../types';
import { printHtml, resolveDebugElement } from '../utility';

type DebugSignature = <Component, Html extends HTMLElement>(
  q?: QueryTarget<Component, Html>,
) => void;

export function debug(fixture: ComponentFixture<any>): DebugSignature {
  return <Component, Html extends HTMLElement>(
    root?: QueryTarget<Component, Html>,
  ) => {
    const rootElem = root ?? fixture.nativeElement;
    const element = isNativeElement(rootElem)
      ? rootElem
      : resolveDebugElement(rootElem);
    console.log(printHtml(element));
  };
}
