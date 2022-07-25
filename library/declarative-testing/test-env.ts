import { SpyFactoryFn } from '../types';
import { DeclarativeTestState } from './types';
import { scheduleFn } from './utility';

export class NgtxTestEnv {
  private testState: DeclarativeTestState = {
    assertion: [],
    predicate: [],
    spyRegistry: [],
  };

  public get isAssertionNegated() {
    return this.testState.negateAssertion;
  }

  public getEnvState() {
    return { ...this.testState };
  }

  public importEnvState(state: DeclarativeTestState): void {
    this.testState.assertion.push(...state.assertion);
    this.testState.predicate.push(...state.predicate);
    this.testState.spyRegistry.push(...state.spyRegistry);
  }

  constructor(private spyFactory: SpyFactoryFn) {}

  public spyOn = <T>(
    host: () => T,
    // TODO: remove magic string!
    methodName: keyof T | 'ngtx:spyEvent',
    returnValue?: any,
  ) => {
    const spy = this.spyFactory(returnValue);

    this.testState.spyRegistry.push({
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

    const spiesLeft = this.testState.spyRegistry.filter((spy) => !spy.done);

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

  public updateState = (newState: Partial<DeclarativeTestState>): void => {
    this.testState = {
      ...this.testState,
      ...newState,
    };
  };

  public negateAssertion = (): void => {
    this.testState.negateAssertion = !this.testState.negateAssertion;
  };

  private tryPlaceSpies() {
    this.testState.spyRegistry
      .filter((entry) => !entry.done)
      .forEach((entry) => {
        const { host, methodName } = entry;

        try {
          const instance = host();
          if (instance == null) {
            return;
          }

          instance[methodName] = entry.spy;
          entry.done = true;
        } catch {
          // ignore if host cannot be resolved and try after next tick
          return;
        }
      });
  }
}
