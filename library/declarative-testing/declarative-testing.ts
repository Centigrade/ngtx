import { NgtxFixture } from '../entities/fixture';
import { NGTX_GLOBAL_CONFIG } from '../init-features';
import { SpyFactoryFn } from '../types';
import {
  DeclarativeTestingApi,
  ExtensionFn,
  ExtensionFnMarker,
  ExtensionFnSignature,
} from './api';
import { call, emit } from './lib';
import { NgtxTestEnv } from './test-env';
import { Events, ITargetResolver, PublicApi, TargetRef } from './types';
import { createList } from './utility';

export const createDeclarativeTestingApi = (
  fx: NgtxFixture<any, any>,
  existingTestEnv?: NgtxTestEnv,
) => {
  let spyFactory: SpyFactoryFn | undefined;

  const when: Omit<DeclarativeTestingApi, 'setSpyFactory'> = <
    Html extends HTMLElement,
    Type,
  >(
    target: TargetRef<Html, Type>,
  ) => {
    const testEnv: NgtxTestEnv =
      existingTestEnv ??
      new NgtxTestEnv(spyFactory ?? NGTX_GLOBAL_CONFIG.defaultSpyFactory);

    const assertionsApi = <Html extends HTMLElement, Type>(
      target: TargetRef<Html, Type>,
    ) => ({
      to(...fns: ExtensionFn<Html, Type>[]) {
        fns.forEach((fn) => {
          fn(() => createList(target()), testEnv, fx);
        });

        testEnv.executeTest();
      },
    });

    const expectationApi = {
      and: createDeclarativeTestingApi(fx, testEnv),
      expect<Html extends HTMLElement, Type>(target: TargetRef<Html, Type>) {
        return Object.assign({}, assertionsApi(target), {
          not: new Proxy(expectationApi, {
            get: (_: any, propertyName: string) => {
              testEnv.negateAssertion();
              return assertionsApi(target)[propertyName];
            },
          }),
        });
      },
    };

    const addPredicate = (...fns: ExtensionFn<Html, Type>[]) => {
      fns.forEach((fn) => {
        fn(() => createList(target()), testEnv, fx);
      });

      return expectationApi;
    };

    const callFn = <Out>(
      resolver: ITargetResolver<Html, Type, Out>,
      methodName: keyof PublicApi<Out>,
      args: any[] = [],
    ) => {
      return addPredicate(call(resolver, methodName, args));
    };

    const emitFn = (eventName: Events<Html, Type>, args?: any) =>
      addPredicate(emit(eventName, args));

    return {
      calls: callFn,
      call: callFn,
      emits: emitFn,
      emit: emitFn,
      rendered: () => expectationApi,
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
  });
};

export const createExtension = <Html extends HTMLElement, Component>(
  fn: ExtensionFnSignature<Html, Component>,
) => {
  const marker: ExtensionFnMarker = { __ngtxExtensionFn: true };
  return Object.assign(fn, marker);
};
