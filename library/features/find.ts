import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { isDebugElement } from '../type-guards';
import { Fn, QueryTarget, TypedDebugElement } from '../types';

export function findImpl<Html extends HTMLElement, Component, Out>(
  fixture: ComponentFixture<any>,
  query: QueryTarget<Component, Html>,
  accessor?: Fn<TypedDebugElement<Component, Html>, Out>,
): TypedDebugElement<Component, Html> | Out {
  if (isDebugElement(query)) {
    return accessor ? accessor(query) : query;
  }

  const value =
    typeof query === 'string'
      ? fixture.debugElement.query(By.css(query))
      : fixture.debugElement.query(By.directive(query));

  return accessor ? accessor(value) : value;
}
