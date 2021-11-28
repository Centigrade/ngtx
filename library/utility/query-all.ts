import { By } from '@angular/platform-browser';
import { QueryTarget, TypedDebugElement } from '../types';
import { isNgtxQuerySelector, queryAllNgtxMarker } from './query-ngtx-marker';

export function queryAll<Html extends Element, Component>(
  query: QueryTarget<Component>,
  debugElement: TypedDebugElement<any, any>,
): TypedDebugElement<Html, Component>[] {
  return isNgtxQuerySelector(query)
    ? queryAllNgtxMarker(query as string, debugElement)
    : typeof query === 'string'
    ? debugElement.queryAll(By.css(query))
    : debugElement.queryAll(By.directive(query));
}
