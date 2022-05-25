import { NgtxFixture, NgtxMultiElement } from '../entities';
import { NgtxEmptySet } from './constants';
import { DeclarativeTestState } from './types';

export function isMultiElementRef(
  value: any,
): value is NgtxMultiElement<HTMLElement, unknown> {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  const target = value();
  const isDefined = target != null;
  const isEmptySet = target === NgtxEmptySet;
  return isDefined && (isEmptySet || typeof target.unwrap === 'function');
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
      console.log(
        'subject after predicate:',
        state.subject?.() ?? 'not defined!',
      );
    },
    assertion: () => {
      console.log(
        'object before assertion:',
        state.object?.() ?? 'not defined!',
      );
      runSafelyAndOutputExceptions(originalAssertion, fx, 'assertion');
    },
  };
  return state;
}
