import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { QueryTarget, TypedDebugElement } from '../types';
import { isNgtxQuerySelector } from '../utility';
import { valueOf } from '../utility/signals';
import { getClassName } from '../utility/string.utilities';
import { NgtxScenarioTestIsAssertionNegated } from './symbols';
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
  [NgtxScenarioTestIsAssertionNegated] = false;

  constructor(
    protected readonly queryTarget?: QueryTarget<Component>,
    protected readonly name?: string,
  ) {}

  public get isAssertionNegated() {
    return this[NgtxScenarioTestIsAssertionNegated];
  }

  public get targetName() {
    if (this.name) {
      return this.name;
    }

    return typeof this.queryTarget === 'string'
      ? this.queryTarget
      : getClassName(this.queryTarget);
  }

  public readonly not: Omit<typeof this, 'not'> = new Proxy(this, {
    get: (_, property) => {
      // TODO: docs: document that constructors of Harnesses are not allowed to be overridden!
      const harnessConstructor = this.constructor as any;
      const target = new harnessConstructor(this.queryTarget, this.name);

      target[NgtxScenarioTestIsAssertionNegated] =
        !this[NgtxScenarioTestIsAssertionNegated];

      return (target as any)[property];
    },
  });

  public toBeFound(): NgtxScenarioTestingExtensionFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.targetName}] should ${verb} found`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target).toBeFalsy();
        } else {
          expect(target).toBeTruthy();
        }
      });
    };
  }

  public toBeMissing(): NgtxScenarioTestingExtensionFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.targetName}] should ${verb} missing`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target).toBeTruthy();
        } else {
          expect(target).toBeFalsy();
        }
      });
    };
  }

  public toContainText(text: string): NgtxScenarioTestingExtensionFn {
    const verb = this.isAssertionNegated ? 'not contain' : 'contain';

    return ({ query }) => {
      it(`[${this.targetName}] should ${verb} text "${text}"`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target.nativeElement.textContent).not.toContain(text);
        } else {
          expect(target.nativeElement.textContent).toContain(text);
        }
      });
    };
  }

  public toBeEnabled(value = true): NgtxScenarioTestingExtensionFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';
    const state = value ? 'enabled' : 'disabled';

    return ({ query }) => {
      it(`[${this.targetName}] should ${verb} ${state}`, () => {
        const target = query(this.queryTarget);
        const component = target.componentInstance as any;
        const nativeElement = target.nativeElement as any;

        if (this.isAssertionNegated) {
          if ('disabled' in component) {
            return expect(valueOf(component.disabled)).not.toBe(!value);
          } else if ('enabled' in component) {
            return expect(valueOf(component.enabled)).not.toBe(value);
          } else if ('disabled' in nativeElement) {
            return expect(nativeElement.disabled).not.toBe(!value);
          } else if ('enabled' in nativeElement) {
            // hint: e.g. web-components might have an enabled api
            return expect(nativeElement.enabled).not.toBe(value);
          }
        } else {
          if ('disabled' in component) {
            return expect(valueOf(component.disabled)).toBe(!value);
          } else if ('enabled' in component) {
            return expect(valueOf(component.enabled)).toBe(value);
          } else if ('disabled' in nativeElement) {
            return expect(nativeElement.disabled).toBe(!value);
          } else if ('enabled' in nativeElement) {
            // hint: e.g. web-components might have an enabled api
            return expect(nativeElement.enabled).toBe(value);
          }
        }

        // hint: if no case matches, the target does not offer a enabled/disabled feature, failure:
        throw new Error(
          `${
            this.queryTarget ?? 'host'
          } doesn't have a "enabled" or "disabled" property`,
        );
      });
    };
  }

  public toHaveState(
    stateDef: StateWithUnwrappedSignals<Component>,
  ): NgtxScenarioTestingExtensionFn {
    const verb = this.isAssertionNegated ? 'not have' : 'have';

    return ({ query }) => {
      const objectKeys = Object.keys(stateDef) as (keyof Component)[];
      for (const propertyName of objectKeys) {
        const propertyNameAsString = propertyName.toString();

        it(`[${this.targetName}] should ${verb} correct value for property "${propertyNameAsString}"`, () => {
          const target = query(this.queryTarget);
          const propertyValue = target.componentInstance[propertyName];
          const rawValue = valueOf(propertyValue);

          if (this.isAssertionNegated) {
            expect(rawValue).not.toEqual(stateDef[propertyName]);
          } else {
            expect(rawValue).toEqual(stateDef[propertyName]);
          }
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
          targetName: this.targetName,
          isAssertionNegated: this.isAssertionNegated,
        }),
      );
  }
}

// --------

export type NgtxScenarioTesting<T> = {
  scenario: ScenarioTestingEnvironment<T>['addTestScenario'];
  useFixture: ScenarioTestingEnvironment<T>['setFixture'];
};
