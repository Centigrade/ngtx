import { isSignal, Signal, untracked } from '@angular/core';

export function valueOf<T>(value: T | Signal<T>): T {
  return isSignal(value) ? untracked(() => value()) : value;
}
