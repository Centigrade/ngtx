import { NgtxFixture } from '../core/fixture';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { SpyFactoryFn } from '../types';
import { call, emit } from './lib';
import { NgtxTestEnv } from './test-env';
import {
  DeclarativeTestingApi,
  Events,
  ExtensionFn,
  ExtensionFnMarker,
  ExtensionFnSignature,
  PublicApi,
  TargetRef,
  TargetResolver,
} from './types';

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
          fn(target, testEnv, fx);
        });

        testEnv.executeTest();
      },
    });

    const expectationApi = {
      and: <Html extends HTMLElement, Type>(
        first: TargetRef<Html, Type> | ExtensionFn<Html, Type>,
        ...others: any[]
      ) => {
        const isExtensionFn = isExtension<Html, Type>(first);

        if (isExtensionFn) {
          return addPredicate(...[first, ...others]);
        } else {
          return (
            createDeclarativeTestingApi(fx, testEnv) as DeclarativeTestingApi
          )(first);
        }
      },
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
        fn(() => target(), testEnv, fx);
      });

      return expectationApi;
    };

    const callFn = <Out>(
      resolver: TargetResolver<Html, Type, Out>,
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

function isExtension<Html extends HTMLElement, Type>(
  value: TargetRef<Html, Type> | ExtensionFn<Html, Type>,
): value is ExtensionFn<Html, Type> {
  return (value as ExtensionFn<Html, Type>).__ngtxExtensionFn === true;
}
