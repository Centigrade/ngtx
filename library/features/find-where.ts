import { ComponentFixture } from '@angular/core/testing';
import { Fn, QueryTarget, TypedDebugElement } from '../types';
import { findAllImpl } from './find-all';

export function findWhereImpl<Html extends HTMLElement, Component, Out>(
  fixture: ComponentFixture<any>,
  condition: Fn<TypedDebugElement<Component, Html>, boolean>,
  queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
  converter?: Fn<TypedDebugElement<Component, Html>, Out>,
): TypedDebugElement<Component, Html> | Out {
  const results: TypedDebugElement<Component, Html>[] = findAllImpl(
    fixture,
    queryTarget,
  );
  const item = results.find(condition);

  return converter ? converter(item) : item;
}
