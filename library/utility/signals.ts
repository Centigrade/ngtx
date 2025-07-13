import { isSignal, Signal, untracked, WritableSignal } from '@angular/core';

export function valueOf<T>(value: T | Signal<T>): T {
  return isSignal(value) ? untracked(() => value()) : value;
}

export function isWritableSignal(
  value: unknown,
): value is WritableSignal<unknown> {
  return isSignal(value) && 'set' in value;
}
