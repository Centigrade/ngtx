import { NgtxFixture } from '../entities/fixture';
import { NGTX_GLOBAL_CONFIG } from '../init-features';
import { SpyFactoryFn } from '../types';
import { DeclarativeTestingApi, ExtensionFn } from './api';
import {
  DeclarativeTestState,
  PublicApi,
  SpyRegisterEntry,
  TargetRef,
} from './types';
import { asMultiElement } from './utility';

export class TestEnv {
  public testState: DeclarativeTestState = {};
  public spyRegistry: SpyRegisterEntry[] = [];

  constructor(public spyFactory: SpyFactoryFn) {}

  public spyOn<T>(
    host: () => T,
    methodName: keyof PublicApi<T>,
    returnValue?: any,
  ) {
    const spy = this.spyFactory(returnValue);

    this.spyRegistry.push({
      host,
      methodName: methodName as string,
      done: false,
      spy,
    });

    return spy;
  }

  public tryPlaceSpies() {
    this.spyRegistry
      .filter((entry) => !entry.done)
      .forEach((entry) => {
        const { host, methodName } = entry;

        try {
          const instance = host();

          if (instance) {
            console.log(instance);
            instance[methodName] = entry.spy;
            entry.done = true;
          }
        } catch {
          // ignore if host cannot be resolved and try after next tick
          return;
        }
      });
  }

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

    console.log(
      'assertion end',
      spiesLeft.map((s) => ({
        spy: s.host()?.constructor.name + '.' + s.methodName,
        done: s.done,
      })),
      this.spyRegistry.map((s) => ({
        spy: s.host()?.constructor.name + '.' + s.methodName,
        done: s.done,
      })),
    );

    if (spiesLeft.length > 0) {
      const errorMessage = `[ngtx]: Not all spies could be placed. Spies left: [${spiesLeft
        .map((s) => `${s.host()?.constructor?.name}.${s.methodName}`)
        .join(', ')}]`;
      throw new Error(errorMessage);
    }
  }

  public updateState(newState: DeclarativeTestState): void {
    this.testState = {
      ...this.testState,
      ...newState,
    };
  }

  public negateAssertion(): void {
    this.testState.negateAssertion = !this.testState.negateAssertion;
  }
}

export const createDeclarativeTestingApi = (
  fx: NgtxFixture<any, any>,
  existingTestEnv?: TestEnv,
) => {
  let spyFactory =
    existingTestEnv?.spyFactory?.bind(existingTestEnv) ??
    NGTX_GLOBAL_CONFIG.defaultSpyFactory;

  const when: Omit<DeclarativeTestingApi, 'setSpyFactory'> = <
    Html extends HTMLElement,
    Type,
  >(
    target: TargetRef<Html, Type>,
  ) => {
    const testEnv: TestEnv = existingTestEnv ?? new TestEnv(spyFactory);

    const assertionsApi = <Html extends HTMLElement, Type>(
      target: TargetRef<Html, Type>,
    ) => ({
      to(...fns: ExtensionFn<Html, Type>[]) {
        fns.forEach((fn) => {
          testEnv.updateState(
            fn(
              () => asMultiElement(target),
              testEnv.testState,
              fx,
              testEnv.spyOn.bind(testEnv),
            ),
          );
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
        testEnv.updateState(
          fn(
            () => asMultiElement(target),
            testEnv.testState,
            fx,
            testEnv.spyOn.bind(testEnv),
          ),
        );
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
  });
};
