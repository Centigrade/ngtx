import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { QueryTarget, TypedDebugElement } from '../types';

export function isNgtxQuerySelector(selector: QueryTarget<any>): boolean {
  if (typeof selector !== 'string') {
    return false;
  }

  return selector.startsWith('ngtx_');
}

export function queryNgtxMarker<Html extends HTMLElement, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component> {
  const { candidates, queryRequirements } = getCandidates(query, debugElement);

  return (
    candidates.find((candidate) => {
      const element = candidate.nativeElement as HTMLElement;
      const ngtxAttr = element.getAttribute('data-ngtx');
      const aliases = ngtxAttr?.split(' ');

      return aliases != null
        ? queryRequirements.every((name) => aliases.includes(name))
        : false;
    }) ?? null!
  );
}

export function queryAllNgtxMarker<Html extends HTMLElement, Component>(
  query: string,
  debugElement: DebugElement,
): TypedDebugElement<Html, Component>[] {
  const { candidates, queryRequirements } = getCandidates(query, debugElement);
  const targets = candidates.filter((candidate) => {
    const element = candidate.nativeElement as HTMLElement;
    const ngtxAttr = element.getAttribute('data-ngtx');
    const aliases = ngtxAttr?.split(' ');
    return aliases != null
      ? queryRequirements.every((name) => aliases.includes(name))
      : false;
  });

  return targets.length === 0 ? null! : targets;
}

function getCandidates(query: string, debugElement: DebugElement) {
  const queryTarget = stripNgtxMarker(query);
  const queryRequirements = queryTarget.split(' ');
  const candidates = debugElement.queryAll(
    By.css(`[data-ngtx*="${queryTarget}"]`),
  );
  return { candidates, queryRequirements };
}

// -----------------------------------
//  Module Internals
// -----------------------------------

function stripNgtxMarker(query: string): string {
  return query.replace('ngtx_', '');
}
