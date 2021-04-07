import { ComponentFixture } from '@angular/core/testing';
import { findImpl } from '../features/find';
import { isDebugElement } from '../type-guards';
import { QueryTarget } from '../types';

export function resolveDebugElement<Html extends HTMLElement, Component>(
  queryTarget: QueryTarget<Component, Html>,
  fixture: ComponentFixture<any>,
) {
  if (isDebugElement(queryTarget)) {
    return queryTarget;
  }

  return findImpl<Html, Component, never>(fixture, queryTarget);
}
