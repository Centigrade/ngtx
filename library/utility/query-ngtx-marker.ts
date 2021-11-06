import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TypedDebugElement } from '../types';

export function queryNgtxMarker<Html extends Element, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component> {
  return debugElement.query(By.css(`[data-ngtx="${query}"]`));
}

export function queryAllNgtxMarker<Html extends Element, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component>[] {
  return debugElement.queryAll(By.css(`[data-ngtx="${query}"]`));
}
