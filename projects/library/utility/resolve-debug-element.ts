import { isDebugElement } from '../type-guards';
import { QueryTarget } from '../types';

export function resolveDebugElement<Html extends HTMLElement, Component>(
  queryTarget: QueryTarget<Component, Html>,
) {
  if (isDebugElement(queryTarget)) {
    return queryTarget;
  }

  return find<Html, Component, never>(queryTarget);
}
