import { DebugElement } from '@angular/core';
import * as findFeature from '../features/find';
import { resolveDebugElement } from './resolve-debug-element';

describe('resolveDebugElement', () => {
  it('should return the same debugElement if a debugElement was given', () => {
    // arrange
    const debugElement = new DebugElement();

    // act, assert
    expect(resolveDebugElement(debugElement, undefined)).toBe(debugElement);
  });

  it('should call ngtx find implementation if input is of type string', () => {
    // arrange
    const fixture: any = {};
    spyOn(findFeature, 'findImpl');
    const queryTarget = 'string';

    // act
    resolveDebugElement(queryTarget, fixture);

    // assert
    expect(findFeature.findImpl).toHaveBeenCalledTimes(1);
    expect(findFeature.findImpl).toHaveBeenCalledWith(fixture, queryTarget);
  });
});
