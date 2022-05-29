import { NgtxFixture } from '../entities';
import { ExtensionFn } from './api';
import { Events, PropertyState } from './types';
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

export const attributes =
  <Html extends HTMLElement>(
    stateDef: PropertyState<Html> | PropertyState<Html>[],
  ): ExtensionFn<Html, any> =>
  (target, { predicate }, fixture) => {
    return {
      predicate: () => {
        predicate?.();

        const element = target();
        const states = asArray(stateDef);

        checkAssertionsCountMatchesFoundElementCount(
          'attributes',
          states,
          element,
        );

        states.forEach((state, index) => {
          const subject = element.atIndex(index);
          const props = Object.entries(state) as [string, any][];

          props.forEach(([key, value]) => {
            subject.nativeElement[key] = value;
          });

          fixture.detectChanges();
        });
      },
    };
  };

export const haveAttributes =
  <Html extends HTMLElement>(
    stateDef: PropertyState<Html> | PropertyState<Html>[],
  ): ExtensionFn<Html, any> =>
  (target, { assertion, negateAssertion }, fx) => {
    return {
      assertion: () => {
        const states = asArray(stateDef);
        const element = target();

        checkAssertionsCountMatchesFoundElementCount(
          'haveAttributes',
          states,
          element,
        );

        states.forEach((state, index) => {
          const subject = element.atIndex(index);
          const props = Object.entries(state) as [string, any][];

          props.forEach(([key, value]) => {
            const property = subject.attr(key);

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

export const state =
  <T>(
    stateDef: PropertyState<T> | PropertyState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { predicate }, fixture) => {
    return {
      predicate: () => {
        predicate?.();

        const element = target();
        const states = asArray(stateDef);

        checkAssertionsCountMatchesFoundElementCount('state', states, element);

        states.forEach((state, index) => {
          const subject = element.atIndex(index);
          const props = Object.entries(state) as [string, any][];

          props.forEach(([key, value]) => {
            subject.componentInstance[key] = value;
          });

          fixture.detectChanges();
        });
      },
    };
  };

export const haveState =
  <T>(
    stateDef: PropertyState<T> | PropertyState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { assertion, negateAssertion }) => {
    return {
      assertion: () => {
        const states = asArray(stateDef);
        const element = target();

        checkAssertionsCountMatchesFoundElementCount(
          'haveState',
          states,
          element,
        );

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
