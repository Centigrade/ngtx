import { NgtxFixture } from '../entities';
import { ExtensionFn } from './api';
import { ComponentState, Events } from './types';
import {
  asArray,
  checkAssertionsCountMatchesFoundElementCount,
} from './utility';

export const debug: ExtensionFn<HTMLElement, any> = (
  _,
  { predicate, assertion },
  fixture,
) => {
  return {
    predicate: () => {
      runSafely(predicate, fixture);
    },
    assertion: () => {
      runSafely(assertion, fixture);
    },
  };
};

export const emit =
  <Html extends HTMLElement, Type>(
    eventName: Events<Html, Type>,
    args?: any,
  ): ExtensionFn<Html, Type> =>
  (target, { predicate }, fixture) => {
    return {
      predicate: () => {
        predicate?.();

        target().forEach((subject) => {
          subject.triggerEvent(eventName as string, args);
        });

        fixture.detectChanges();
      },
    };
  };

export const state =
  <T>(
    stateDef: ComponentState<T> | ComponentState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { predicate }, fixture) => {
    return {
      predicate: () => {
        console.log('state');

        const element = target();
        const states = asArray(stateDef);

        states.forEach((state, index) => {
          const subject = element.atIndex(index);
          const props = Object.entries(state) as [string, any][];

          props.forEach(([key, value]) => {
            subject.componentInstance[key] = value;
          });

          fixture.detectChanges();
        });

        predicate?.();
      },
    };
  };

export const haveState =
  <T>(
    stateDef: ComponentState<T> | ComponentState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { assertion, negateAssertion }) => {
    return {
      assertion: () => {
        const states = asArray(stateDef);
        const element = target();

        checkAssertionsCountMatchesFoundElementCount(states, element);

        states.forEach((state, index) => {
          const subject = element.atIndex(index);
          const props = Object.entries(state) as [string, any][];

          props.forEach(([key, value]) => {
            const property = subject.componentInstance[key];

            if (negateAssertion) {
              expect(property).not.toEqual(value);
            } else {
              expect(property).toEqual(value);
            }
          });
        });

        assertion?.();
      },
    };
  };

// -------------------------------------
// Module internals
// -------------------------------------
function runSafely(
  fn: (() => void) | undefined,
  fixture: NgtxFixture<HTMLElement, any>,
) {
  let error: Error | undefined;

  try {
    fn?.();
  } catch (err) {
    error = err as Error;
    console.log(`ngtx [debug]: ${error.message}:`);
    fixture.rootElement.debug();
  } finally {
    if (error) throw error;
  }
}
