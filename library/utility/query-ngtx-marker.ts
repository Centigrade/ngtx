import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TypedDebugElement } from '../types';

export function queryNgtxMarker<Html extends Element, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component> {
  const queryTarget = stripNgtxMarker(query);
  return debugElement.query(By.css(`[data-ngtx="${queryTarget}"]`));
}

export function queryAllNgtxMarker<Html extends Element, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component>[] {
  const queryTarget = stripNgtxMarker(query);
  return debugElement.queryAll(By.css(`[data-ngtx="${queryTarget}"]`));
}

// -----------------------------------
//  Module Internals
// -----------------------------------

function stripNgtxMarker(query: string): string {
  return query.replace('ngtx_', '');
}
