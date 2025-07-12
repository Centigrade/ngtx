import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { QueryTarget, TypedDebugElement } from '../types';
import { isNgtxQuerySelector } from '../utility';
import { valueOf } from '../utility/signals';
import {
  ComponentFixtureRef,
  NgtxScenarioTestingExtensionFn,
  NgtxScenarioTestingHarnessExtensionFn,
  NgtxTestingFrameworkAdapter,
  RemoteLogicFn,
  StateWithUnwrappedSignals,
} from './types';

export function ngtxScenarioTesting<T>(
  fn: (scenarioTesting: NgtxScenarioTesting<T>) => unknown,
) {
  const { testingFrameworkAdapter } = NGTX_GLOBAL_CONFIG;

  const env = new ScenarioTestingEnvironment<T>(testingFrameworkAdapter!);
  const userLandEnv: NgtxScenarioTesting<T> = {
    scenario: env.addTestScenario.bind(env),
    useFixture: env.setFixture.bind(env),
  };

  fn(userLandEnv);
}

// --------------------------------
// --------------------------------
// --------------------------------

class ScenarioTestingEnvironment<Component> {
  #fixture!: ComponentFixture<Component>;
  readonly #fixtureRef = () => this.#fixture;

  constructor(
    public readonly testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
  ) {}

  public setFixture(fixture: ComponentFixture<Component>) {
    this.#fixture = fixture;
  }

  public addTestScenario(description: string) {
    return new TestScenario(
      description,
      this.#fixtureRef,
      this.testingFrameworkAdapter,
    );
  }
}

class TestScenario<Component> {
  private readonly get = <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
  ): TypedDebugElement<Html, Component> => {
    if (target == undefined) {
      return this.#fixtureRef().debugElement;
    }

    if (typeof target === 'string') {
      const selector = isNgtxQuerySelector(target)
        ? `[data-ngtx="${target}"]`
        : target;

      return this.#fixtureRef().debugElement.query(By.css(selector));
    }

    return this.#fixtureRef().debugElement.query(By.directive(target));
  };

  #fixtureRef: ComponentFixtureRef;
  #testingFrameworkAdapter: NgtxTestingFrameworkAdapter;
  #setupFns: RemoteLogicFn<Component>[] = [];

  constructor(
    public description: string,
    fixtureRef: ComponentFixtureRef,
    testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
  ) {
    this.#fixtureRef = fixtureRef;
    this.#testingFrameworkAdapter = testingFrameworkAdapter;
  }

  public setup(...functions: RemoteLogicFn<any>[]) {
    this.#setupFns = [...this.#setupFns, ...functions];
    return this;
  }

  public expect(...tests: RemoteLogicFn<any>[]) {
    const { describe, beforeEach } = this.#testingFrameworkAdapter;

    describe(this.description, () => {
      beforeEach(async () => {
        for (const setup of this.#setupFns) {
          await setup({
            fixtureRef: this.#fixtureRef,
            query: this.get,
          });
        }
      });

      // hint: immediately call test generator fns to add tests
      for (const test of tests) {
        test({
          fixtureRef: this.#fixtureRef,
          query: this.get,
        });
      }
    });
  }
}

export class ScenarioTestingHarness<Html extends HTMLElement, Component> {
  constructor(protected readonly queryTarget?: QueryTarget<Component>) {}

  public toBeFound(): NgtxScenarioTestingExtensionFn {
    return ({ query }) => {
      it('should be found', () => {
        const target = query(this.queryTarget);
        expect(target).toBeTruthy();
      });
    };
  }

  public toContainText(text: string): NgtxScenarioTestingExtensionFn {
    return ({ query }) => {
      it(`should contain text "${text}"`, () => {
        const target = query(this.queryTarget);
        expect(target.nativeElement.textContent).toContain(text);
      });
    };
  }

  public toBeEnabled(value = true): NgtxScenarioTestingExtensionFn {
    const state = value ? 'enabled' : 'disabled';

    return ({ query }) => {
      it(`should be ${state}`, () => {
        const target = query(this.queryTarget);
        const component = target.componentInstance as any;
        const nativeElement = target.nativeElement as any;

        if ('disabled' in component) {
          expect(valueOf(component.disabled)).toBe(!value);
        } else if ('enabled' in component) {
          expect(valueOf(component.enabled)).toBe(value);
        } else if ('disabled' in nativeElement) {
          expect(nativeElement.disabled).toBe(!value);
        } else if ('enabled' in nativeElement) {
          // hint: e.g. web-components might have an enabled api
          expect(nativeElement.enabled).toBe(value);
        } else {
          throw new Error(
            `${
              this.queryTarget ?? 'host'
            } doesn't have a "enabled" or "disabled" property`,
          );
        }
      });
    };
  }

  public toHaveState(
    stateDef: StateWithUnwrappedSignals<Component>,
  ): NgtxScenarioTestingExtensionFn {
    return ({ query }) => {
      const objectKeys = Object.keys(stateDef) as (keyof Component)[];
      for (const propertyName of objectKeys) {
        const propertyNameAsString = propertyName.toString();

        it(`should have correct value for property "${propertyNameAsString}"`, () => {
          const target = query(this.queryTarget);
          const propertyValue = target.componentInstance[propertyName];
          const rawValue = valueOf(propertyValue);

          expect(rawValue).toEqual(stateDef[propertyName]);
        });
      }
    };
  }

  public to(
    ...testAssertions: NgtxScenarioTestingHarnessExtensionFn<Html, Component>[]
  ): NgtxScenarioTestingExtensionFn {
    return (env) =>
      testAssertions.forEach((assertion) =>
        assertion({
          ...env,
          targetRef: () => env.query(this.queryTarget),
        }),
      );
  }
}

// --------

export type NgtxScenarioTesting<T> = {
  scenario: ScenarioTestingEnvironment<T>['addTestScenario'];
  useFixture: ScenarioTestingEnvironment<T>['setFixture'];
};
