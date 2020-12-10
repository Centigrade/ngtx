import { ComponentFixture } from '@angular/core/testing';
import { Fn, QueryTarget, TypedDebugElement } from '../types';
import { queryAll } from '../utility';

export function findAllImpl<Html extends HTMLElement, Component, Out>(
  fixture: ComponentFixture<any>,
  queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
  accessor?: Fn<TypedDebugElement<Component, Html>[], Out[]>,
): TypedDebugElement<Component, Html>[] | Out[] {
  const queriesAsArray = Array.isArray(queryTarget)
    ? queryTarget
    : [queryTarget];
  const results: TypedDebugElement<Component, Html>[] = [];

  for (const query of queriesAsArray) {
    const resultList = queryAll(query, fixture);
    results.push(...resultList);
  }

  return accessor ? accessor(results) : results;
}
