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
import {
  DeclarativeTestState,
  Events,
  ITargetResolver,
  PublicApi,
  SpyRegisterEntry,
  TargetRef,
} from './types';
import { scheduleFn } from './utility';

export class NgtxTestEnv {
  private testState: DeclarativeTestState = {};
  private spyRegistry: SpyRegisterEntry[] = [];

  public get isAssertionNegated() {
    return this.testState.negateAssertion;
  }

  constructor(private spyFactory: SpyFactoryFn) {}

  public spyOn = <T>(
    host: () => T,
    // TODO: remove magic string!
    methodName: keyof PublicApi<T> | 'ngtx:spyEvent',
    returnValue?: any,
  ) => {
    const spy = this.spyFactory(returnValue);

    this.spyRegistry.push({
      host,
      methodName: methodName as string,
      done: false,
      spy,
    });

    return spy;
  };

  public executeTest() {
    const predicates = this.testState.predicate ?? [];
    predicates.forEach((predicate) => {
      // try to place spies as early as possible. If spy-target could not be found, retry before next predicate call
      this.tryPlaceSpies();
      predicate();
    });

    const assertions = this.testState.assertion ?? [];
    assertions.forEach((assertion) => {
      assertion();
    });

    const spiesLeft = this.spyRegistry.filter((spy) => !spy.done);

    if (spiesLeft.length > 0) {
      const errorMessage = `[ngtx]: Not all spies could be placed. Spies left: [${spiesLeft
        .map((s) => `${s.host()?.constructor?.name}.${s.methodName}`)
        .join(', ')}]`;
      throw new Error(errorMessage);
    }
  }

  public addAssertion = (fn: () => void): void => {
    this.updateState({
      assertion: scheduleFn(this.testState.assertion, () => fn()),
    });
  };

  public addPredicate = (fn: () => void): void => {
    this.updateState({
      predicate: scheduleFn(this.testState.predicate, () => fn()),
    });
  };

  public updateState = (newState: DeclarativeTestState): void => {
    this.testState = {
      ...this.testState,
      ...newState,
    };
  };

  public negateAssertion = (): void => {
    this.testState.negateAssertion = !this.testState.negateAssertion;
  };

  private tryPlaceSpies() {
    this.spyRegistry
      .filter((entry) => !entry.done)
      .forEach((entry) => {
        const { host, methodName } = entry;

        try {
          const instance = host();
          if (instance == null) {
            return;
          }

          // TODO: refactor magic string!
          if (methodName.startsWith('ngtx:spyEvent')) {
            const targetIsEventEmitter =
              typeof instance === 'object' &&
              typeof instance.emit === 'function';

            if (targetIsEventEmitter) {
              instance.emit = entry.spy;
              entry.done = true;
            }
          } else {
            instance[methodName] = entry.spy;
            entry.done = true;
          }
        } catch {
          // ignore if host cannot be resolved and try after next tick
          return;
        }
      });
  }
}

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
        fn(() => target(), testEnv, fx);
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
