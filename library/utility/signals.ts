import { isSignal, Signal, untracked, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { StateWithUnwrappedSignals } from '../types';

export function valueOf<T, A extends Signal<T>[]>(value: T): T[];
export function valueOf<T>(value: T | Signal<T>): T;
export function valueOf<T, A extends Signal<T>[]>(
  value: A | T | Signal<T>,
): T | T[] {
  if (Array.isArray(value)) {
    return value.map((v) => valueOf(v)) as T[];
  }
  if (isBehaviorSubject(value)) {
    return value.value;
  }

  return isSignal(value) ? untracked(() => value()) : value;
}

export function setValue<T, K extends keyof T & string>(
  property: K,
  object: T,
  value: StateWithUnwrappedSignals<T>[K],
  fixture?: ComponentFixture<any>,
) {
  const unwrappedValue = valueOf(value);

  if (isSignal(object[property])) {
    if (isWritableSignal(object[property]))
      object[property].set(unwrappedValue);
    else if (fixture) fixture.componentRef.setInput(property, unwrappedValue);
    else
      console.warn(
        '[ngtx] cannot set value',
        unwrappedValue,
        `on non-writable signal "${property}:`,
        object[property],
      );
  } else if (isSubject(object[property])) {
    object[property].next(unwrappedValue);
  } else {
    (object as any)[property] = unwrappedValue;
  }
}

function isSubject(value: unknown): value is Subject<any> {
  return typeof value === 'object' && value !== null && 'next' in value;
}

function isBehaviorSubject(value: unknown): value is BehaviorSubject<any> {
  return isSubject(value) && 'value' in value;
}

export function isWritableSignal(
  value: unknown,
): value is WritableSignal<unknown> {
  return isSignal(value) && 'set' in value;
}
