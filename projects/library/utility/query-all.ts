import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { isDebugElement } from '../type-guards';
import { QueryTarget } from '../types';

export function queryAll<Html extends HTMLElement, Component>(
  query: QueryTarget<Component, Html>,
  fixture: ComponentFixture<any>,
) {
  if (isDebugElement(query)) {
    return [query];
  }

  return typeof query === 'string'
    ? fixture.debugElement.queryAll(By.css(query))
    : fixture.debugElement.queryAll(By.directive(query));
}
