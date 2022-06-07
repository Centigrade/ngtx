import { SpyFactoryFn } from '../types';
import { DeclarativeTestState, PublicApi, SpyRegisterEntry } from './types';
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
