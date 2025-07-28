import { isSignal, Signal, untracked, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { StateWithUnwrappedSignals } from '../types';

export function valueOf<T>(value: T | Signal<T>): T {
  return isSignal(value) ? untracked(() => value()) : value;
}

export function setValue<T, K extends keyof T>(
  property: K,
  object: T,
  value: StateWithUnwrappedSignals<T>[K],
) {
  if (isWritableSignal(object[property])) {
    object[property].set(value);
  } else if (isSubject(object[property])) {
    // TODO: set subject value
  }
  // TODO: set normal property value
}

function isSubject(value: unknown): value is Subject<any> {
  return typeof value === 'object' && 'next' in value;
}

export function isWritableSignal(
  value: unknown,
): value is WritableSignal<unknown> {
  return isSignal(value) && 'set' in value;
}
