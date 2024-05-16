import { NgtxFixture } from '../core/fixture';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { SpyFactoryFn } from '../types';
import { call, emit } from './lib';
import { NgtxTestState } from './symbols';
import { NgtxTestEnv } from './test-env';
import {
  CallSiteResolver,
  Events,
  ExpectApi,
  ExtensionFn,
  ExtensionFnMarker,
  ExtensionFnSignature,
  PredicateApi,
  TargetRef,
  TestStateExporter,
  WhenStatement,
} from './types';
import { asNgtxElementListRef } from './utility';

export const createDeclarativeTestingApi = (
  fx: NgtxFixture<any, any>,
  existingTestEnv?: NgtxTestEnv,
): WhenStatement => {
  let spyFactory: SpyFactoryFn | undefined;

  const when: Omit<WhenStatement, 'setSpyFactory'> = <
    Html extends HTMLElement,
    Type,
  >(
    target: TargetRef<Html, Type> | ExpectApi<Html, Type>,
  ) => {
    const testEnv: NgtxTestEnv =
      existingTestEnv ??
      new NgtxTestEnv(spyFactory ?? NGTX_GLOBAL_CONFIG.defaultSpyFactory);

    const assertionsApi = <Html extends HTMLElement, Type>(
      target: TargetRef<Html, Type> | NgtxTestEnv,
      ...others: NgtxTestEnv[]
    ) => {
      if (target instanceof NgtxTestEnv) {
        // import passed in test-envs:
        // case: .expect( When(x).rendered().expect(y).will(z) )
        [target, ...others].forEach((testEnvToImport) => {
          testEnv.importState(testEnvToImport.getState());
        });

        return testEnv.executeTest();
      }

      const addAssertions = (fns: ExtensionFn<Html, Type>[]) => {
        const elementListRef = asNgtxElementListRef<Html, Type>(target);

        fns.forEach((fn) => {
          fn(elementListRef, testEnv, fx);
        });
      };

      return {
        to(...fns: ExtensionFn<Html, Type>[]): void {
          addAssertions(fns);
          testEnv.executeTest();
        },
        will(...fns: ExtensionFn<Html, Type>[]): NgtxTestEnv {
          addAssertions(fns);
          return testEnv;
        },
      };
    };

    const expectationApi = {
      [NgtxTestState]: testEnv,
      and: <Html extends HTMLElement, Type>(
        first: TargetRef<Html, Type> | ExtensionFn<Html, Type>,
        ...others: any[]
      ) => {
        const isExtensionFn = isExtension<Html, Type>(first);

        if (isExtensionFn) {
          return addPredicate(...[first, ...others]);
        } else if (hasTestState(first)) {
          // hint: applying all the predicates and assertions from the statement into the current test:
          ([first, ...others] as NgtxTestEnv[]).forEach((state) => {
            const statementTestState = state[NgtxTestState].getState();
            testEnv.importState(statementTestState);
          });

          return addPredicate();
        } else {
          return (createDeclarativeTestingApi(fx, testEnv) as WhenStatement)(
            first,
          );
        }
      },
      expect<Html extends HTMLElement, Type>(
        target: TargetRef<Html, Type>,
        ...others: NgtxTestEnv[]
      ) {
        return Object.assign(
          { [NgtxTestState]: testEnv },
          assertionsApi(target, ...others),
          {
            not: new Proxy(expectationApi, {
              get: (_: any, propertyName: string) => {
                testEnv.negateAssertion();
                return assertionsApi(target)?.[propertyName];
              },
            }),
          },
        );
      },
    };

    const addPredicate = (...extensionFns: ExtensionFn<Html, Type>[]) => {
      // TODO: clean this up and think about ways to cleanly import the original subject from expression rather than stubbing one.
      // for chained expressions ( When(the.Button.getsClicked()) ) we need to ensure that a valid target is given,
      // as chained expressions do not expose their internal targets to our current test-state.
      //    When(the.Button.getsClicked()).and(detectChanges())
      //      no target would be existing here ^^^^^^^^^^^^^^^ without this line:
      const predicateTarget: TargetRef<HTMLElement, any> = isExpectApi(target)
        ? () => fx.rootElement
        : target;

      // hint: targetRef could resolve to NgtxElement or NgtxMultiElement. To simplify extension fn implementations, we
      // unify the result to become a List<NgtxElement>. This way extension functions only need to handle the "plural" case,
      // where multiple items were targeted. If a single element was targeted, it is simply the single element in that list.
      const elementListRef = asNgtxElementListRef<Html, Type>(
        predicateTarget as any,
      );

      extensionFns.forEach((fn) => {
        fn(elementListRef, testEnv, fx);
      });

      return expectationApi;
    };

    const callFn = <Out>(
      resolver: CallSiteResolver<Html, Type, Out>,
      methodName: keyof Out,
      args: any[] = [],
    ) => {
      return addPredicate(call(resolver, methodName, args));
    };

    const emitFn = (eventName: Events<Html, Type>, args?: any) =>
      addPredicate(emit(eventName, args));

    if (isExpectApi(target)) {
      const testState = target[NgtxTestState].getState();
      testEnv.importState(testState);
      return expectationApi as ExpectApi<Html, Type>;
    }

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
    } as PredicateApi<Html, Type>;
  };

  return Object.assign(when, {
    setSpyFactory: (spyFt: SpyFactoryFn): void => {
      spyFactory = spyFt;
    },
  }) as WhenStatement;
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

function hasTestState(value: any): value is TestStateExporter {
  return value != null && value[NgtxTestState] instanceof NgtxTestEnv;
}

function isExpectApi<Html extends HTMLElement, Component>(
  value: unknown,
): value is ExpectApi<Html, Component> {
  return (
    typeof value === 'object' &&
    value != null &&
    'expect' in value &&
    'and' in value
  );
}
