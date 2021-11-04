import { By } from '@angular/platform-browser';
import { QueryTarget, TypedDebugElement } from '../types';

export function queryAll<Html extends Element, Component>(
  query: QueryTarget<Html, Component>,
  debugElement: TypedDebugElement<any, any>,
): TypedDebugElement<Html, Component>[] {
  return typeof query === 'string'
    ? debugElement.queryAll(By.css(query))
    : debugElement.queryAll(By.directive(query));
}
