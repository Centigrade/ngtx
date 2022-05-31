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
  testExecutor?: () => void,
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

    const defaultTestExecutor = () => {
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

      const spiesLeft = spiesToPlace.filter((spy) => !spy.done);

      if (spiesLeft.length > 0) {
        const errorMessage = `[ngtx]: Not all spies could be placed. Spies left: [${spiesLeft
          .map((s) => `${s.host()?.constructor?.name}.${s.methodName}`)
          .join(', ')}]`;
        throw new Error(errorMessage);
      }
    };

    let executeTest = testExecutor ?? defaultTestExecutor;

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

    const assertionsApi = <Html extends HTMLElement, Type>(
      target: TargetRef<Html, Type>,
    ) => ({
      to(...fns: ExtensionFn<Html, Type>[]) {
        fns.forEach((fn) => {
          state = {
            ...state,
            ...fn(() => asMultiElement(target), state, fx, spyOn),
          };
        });

        executeTest();
      },
    });

    const expectationApi = {
      and: createDeclarativeTestingApi(fx, state, spyFactory, executeTest),
      expect<Html extends HTMLElement, Type>(target: TargetRef<Html, Type>) {
        return Object.assign({}, assertionsApi(target), {
          not: new Proxy(expectationApi, {
            get: (_: any, propertyName: string) => {
              state.negateAssertion = !state.negateAssertion;
              return assertionsApi(target)[propertyName];
            },
          }),
        });
      },
    };

    const addPredicate = (...fns: ExtensionFn<Html, Type>[]) => {
      fns.forEach((fn) => {
        const newState = fn(() => asMultiElement(target), state, fx, spyOn);
        state = {
          ...state,
          ...newState,
        };
      });

      return expectationApi;
    };

    return {
      has: addPredicate,
      have: addPredicate,
      is: addPredicate,
      are: addPredicate,
      does: addPredicate,
      do: addPredicate,
      gets: addPredicate,
      get: addPredicate,
    };
  };

  return Object.assign(when, {
    setSpyFactory: (spyFt: SpyFactoryFn): void => {
      spyFactory = spyFt;
    },
  }) as DeclarativeTestingApi;
};
