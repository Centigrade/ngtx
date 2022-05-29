import { NgtxFixture } from '../entities/fixture';
import { NGTX_GLOBAL_CONFIG } from '../init-features';
import { SpyFactoryFn } from '../types';
import { DeclarativeTestingApi, ExtensionFn } from './api';
import {
  DeclarativeTestState,
  PublicApi,
  SpyOnFn,
  SpyRegisterEntry,
  TargetRef,
} from './types';
import { asMultiElement } from './utility';

export const createDeclarativeTestingApi = (
  fx: NgtxFixture<any, any>,
  initialTestState: DeclarativeTestState = {
    predicate: [],
    assertion: [],
  },
  defaultSpyFactory?: SpyFactoryFn,
) => {
  let spyFactory = defaultSpyFactory ?? NGTX_GLOBAL_CONFIG.defaultSpyFactory;

  const when: Omit<DeclarativeTestingApi, 'setSpyFactory'> = <
    Html extends HTMLElement,
    Type,
  >(
    target: TargetRef<Html, Type>,
  ) => {
    let state: DeclarativeTestState = initialTestState;
    const spiesToPlace: SpyRegisterEntry[] = [];

    const spyOn: SpyOnFn = <T>(
      host: () => T,
      methodName: keyof PublicApi<T>,
      returnValue?: any,
    ) => {
      const spy = spyFactory(returnValue);
      spiesToPlace.push({
        host,
        methodName: methodName as string,
        done: false,
        spy,
      });

      return spy;
    };

    const tryPlaceSpies = () => {
      spiesToPlace
        .filter((entry) => !entry.done)
        .forEach((entry) => {
          const { host, methodName } = entry;

          try {
            const instance = host();

            if (instance) {
              instance[methodName] = entry.spy;
              entry.done = true;
            }
          } catch {
            // ignore if host cannot be resolved and try after next tick
            return;
          }
        });
    };

    const executeTest = () => {
      const predicates = state.predicate ?? [];
      predicates.forEach((predicate) => {
        // try to place spies as early as possible. If spy-target could not be found, retry before next predicate call
        tryPlaceSpies();
        predicate();
      });
      const assertions = state.assertion ?? [];
      assertions.forEach((assertion) => {
        assertion();
      });
    };

    const expectationApi = {
      and: createDeclarativeTestingApi(fx, state, spyFactory),
      expect<Html extends HTMLElement, Type>(target: TargetRef<Html, Type>) {
        return {
          to(...fns: ExtensionFn<Html, Type>[]) {
            fns.forEach((fn) => {
              state = {
                ...state,
                ...fn(() => asMultiElement(target), state, fx, spyOn),
              };
            });

            executeTest();
          },
        };
      },
    };

    const has = (...fns: ExtensionFn<Html, Type>[]) => {
      fns.forEach((fn) => {
        const newState = fn(() => asMultiElement(target), state, fx, spyOn);
        state = {
          ...state,
          ...newState,
        };
      });

      return expectationApi;
    };

    const emits = (fn: ExtensionFn<Html, Type>) => {
      state = {
        ...state,
        ...fn(() => asMultiElement(target), state, fx, spyOn),
      };

      return expectationApi;
    };

    const calls = (fn: ExtensionFn<Html, Type>) => {
      state = {
        ...state,
        ...fn(() => asMultiElement(target), state, fx, spyOn),
      };

      return expectationApi;
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
      emits,
      emit: emits,
      calls,
    };
  };

  return Object.assign(when, {
    setSpyFactory: (spyFt: SpyFactoryFn): void => {
      spyFactory = spyFt;
    },
  }) as DeclarativeTestingApi;
};
