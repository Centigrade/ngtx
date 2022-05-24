import { Type } from '@angular/core';
import { NgtxFixture, NgtxMultiElement } from '../entities';
import { DeclarativeTestState } from './types';

export function refersToType(
  type: Type<any>,
  value: any,
): value is NgtxMultiElement<HTMLElement, unknown> {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  const target = value();
  return target instanceof type;
}

export function runSafely(fn?: () => void): string {
  if (typeof fn === 'function') {
    try {
      fn?.();
    } catch (error) {
      return `------ Failed to run %s as there was an exception ------`;
    }
  } else {
    return '------ Failed to run %s as it was no function. ------ ';
  }

  return '------ %s passed ------';
}

export function runSafelyAndOutputExceptions(
  fn: undefined | (() => void),
  fx: NgtxFixture<HTMLElement, any>,
  fnType: string,
) {
  const outcome = runSafely(fn);
  const msg = outcome.replace('%s', fnType);
  console.log(msg);
  console.log('DOM at this time:');
  fx.rootElement.debug();
}

export function runTestSafelyAndOutputExceptions(
  state: DeclarativeTestState<HTMLElement, any, HTMLElement, any, any>,
  fx: NgtxFixture<HTMLElement, any>,
) {
  const originalAssertion = state.assertion;
  const originalPredicate = state.predicate;
  state = {
    ...state,
    predicate: () => {
      runSafelyAndOutputExceptions(originalPredicate, fx, 'predicate');
    },
    assertion: () => {
      runSafelyAndOutputExceptions(originalAssertion, fx, 'assertion');
    },
  };
  return state;
}
