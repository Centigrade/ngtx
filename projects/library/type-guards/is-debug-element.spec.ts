import { DebugElement } from '@angular/core';
import { isDebugElement } from './is-debug-element';

describe('isDebugElement', () => {
  it('should return true for values with queryAllNodes and triggerEventHandler functions', () => {
    // arrange
    const anyFn: any = () => {};
    const value: Partial<DebugElement> = {
      queryAllNodes: anyFn,
      triggerEventHandler: anyFn,
    };

    // act, assert
    expect(isDebugElement(value)).toBe(true);
  });

  it('should return for objects not having these properties', () => {
    // arrange
    const value = {};

    // act, assert
    expect(isDebugElement(value)).toBe(false);
  });

  it('should return for objects having these properties with wrong types', () => {
    // arrange
    const anyFn: any = 'some string';
    const value: Partial<DebugElement> = {
      queryAllNodes: anyFn,
      triggerEventHandler: anyFn,
    };

    // act, assert
    expect(isDebugElement(value)).toBe(false);
  });
});
