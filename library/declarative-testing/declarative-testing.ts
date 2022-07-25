import { NgtxFixture } from '../core/fixture';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { SpyFactoryFn } from '../types';
import { call, emit } from './lib';
import { NgtxDeclarativeApi } from './symbols';
import { NgtxTestEnv } from './test-env';
import {
  DeclarativeTestingApi,
  Events,
  ExtensionFn,
  ExtensionFnMarker,
  ExtensionFnSignature,
  NgtxDeclarativeApiStatement,
  TargetRef,
  TargetResolver,
} from './types';
import { asNgtxElementListRef } from './utility';

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
        const elementListRef = asNgtxElementListRef<Html, Type>(target);

        fns.forEach((fn) => {
          fn(elementListRef, testEnv, fx);
        });

        testEnv.executeTest();
      },
    });

    const expectationApi = {
      [NgtxDeclarativeApi]: testEnv,
      and: <Html extends HTMLElement, Type>(
        first: TargetRef<Html, Type> | ExtensionFn<Html, Type>,
        ...others: any[]
      ) => {
        const isExtensionFn = isExtension<Html, Type>(first);

        if (isExtensionFn) {
          return addPredicate(...[first, ...others]);
        } else if (isDeclarativeStatement(first)) {
          // hint: applying all the predicates and assertions from the statement into the current test:
          const statementTestState = first[NgtxDeclarativeApi].getEnvState();
          testEnv.importEnvState(statementTestState);

          return addPredicate();
        } else {
          return (
            createDeclarativeTestingApi(fx, testEnv) as DeclarativeTestingApi
          )(first);
        }
      },
      expect<Html extends HTMLElement, Type>(target: TargetRef<Html, Type>) {
        return Object.assign(
          { [NgtxDeclarativeApi]: testEnv },
          assertionsApi(target),
          {
            not: new Proxy(expectationApi, {
              get: (_: any, propertyName: string) => {
                testEnv.negateAssertion();
                return assertionsApi(target)[propertyName];
              },
            }),
          },
        );
      },
    };

    const addPredicate = (...fns: ExtensionFn<Html, Type>[]) => {
      // hint: targetRef could resolve to NgtxElement or NgtxMultiElement. To simplify extension fn implementations, we
      // unify the result to become a List<NgtxElement>. This way extension functions only need to handle the "plural" case,
      // where multiple items were targeted. If a single element was targeted, it is simply the single element in that list.
      const elementListRef = asNgtxElementListRef<Html, Type>(target);

      fns.forEach((fn) => {
        fn(elementListRef, testEnv, fx);
      });

      return expectationApi;
    };

    const callFn = <Out>(
      resolver: TargetResolver<Html, Type, Out>,
      methodName: keyof Out,
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

function isDeclarativeStatement(
  value: any,
): value is NgtxDeclarativeApiStatement {
  return value != null && value[NgtxDeclarativeApi] instanceof NgtxTestEnv;
}
