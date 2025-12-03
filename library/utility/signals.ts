import { isSignal, Signal, untracked, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { StateWithUnwrappedSignals } from '../types';

export function valueOf<T>(value: T | Signal<T>): T {
  return isSignal(value) ? untracked(() => value()) : value;
}

export function setValue<T, K extends keyof T & string>(
  property: K,
  object: T,
  value: StateWithUnwrappedSignals<T>[K],
  fixture?: ComponentFixture<any>,
) {
  if (isSignal(object[property])) {
    if (isWritableSignal(object[property])) object[property].set(value);
    else if (fixture) fixture.componentRef.setInput(property, value);
  } else if (isSubject(object[property])) {
    object[property].next(value);
  } else {
    (object as any)[property] = value;
  }
}

function isSubject(value: unknown): value is Subject<any> {
  return typeof value === 'object' && value !== null && 'next' in value;
}

export function isWritableSignal(
  value: unknown,
): value is WritableSignal<unknown> {
  return isSignal(value) && 'set' in value;
}
