import { ComponentFixture } from '@angular/core/testing';
import { QueryTarget } from '../types';
import { resolveDebugElement } from '../utility';

export function triggerEventImpl<Html extends HTMLElement, Component>(
  fixture: ComponentFixture<any>,
  eventName: string,
  queryTarget: QueryTarget<Component, Html>,
  eventNameArgs?: any,
): void {
  const debugElement = resolveDebugElement(queryTarget, fixture);
  // no safe access here, to cause an error if no element matches the query.
  debugElement.triggerEventHandler(eventName, eventNameArgs);
}
