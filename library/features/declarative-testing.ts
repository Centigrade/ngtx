import { NgtxFixture } from '../entities/fixture';
import { NGTX_GLOBAL_CONFIG } from '../init-features';
import { DeclarativeTestingApi, ExtensionFn } from './api';
import { DeclarativeTestState, TargetRef } from './types';
import { asMultiElement } from './utility';

export const createDeclarativeTestingApi = (
  fx: NgtxFixture<any, any>,
  initialTestState: DeclarativeTestState = {},
) => {
  let spyFactory = NGTX_GLOBAL_CONFIG.defaultSpyFactory;

  const when: Omit<DeclarativeTestingApi, 'setSpyFactory'> = <
    Html extends HTMLElement,
    Type,
  >(
    target: TargetRef<Html, Type>,
  ) => {
    let state: DeclarativeTestState = initialTestState;

    const executeTest = () => {
      state.predicate?.();
      state.assertion?.();
    };

    const has = (...fns: ExtensionFn<Html, Type>[]) => {
      fns.forEach((fn) => {
        const newState = fn(
          () => asMultiElement(target),
          state,
          fx,
          spyFactory,
        );
        state = {
          ...state,
          ...newState,
        };
      });

      return {
        and: createDeclarativeTestingApi(fx, state),
        expect<Html extends HTMLElement, Type>(target: TargetRef<Html, Type>) {
          return {
            to(...fns: ExtensionFn<Html, Type>[]) {
              fns.forEach((fn) => {
                state = {
                  ...state,
                  ...fn(() => asMultiElement(target), state, fx, spyFactory),
                };
              });

              executeTest();
            },
          };
        },
      };
    };

    return {
      has,
      have: has,
      is: has,
      are: has,
      does: has,
      do: has,
      gets: has,
      get: has,
    };
  };

  return Object.assign(when, {
    setSpyFactory: (spyFt: () => any): void => {
      spyFactory = spyFt;
    },
  }) as DeclarativeTestingApi;
};
