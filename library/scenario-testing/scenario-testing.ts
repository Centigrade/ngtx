import { By } from '@angular/platform-browser';
import {
  QueryTarget,
  StateWithUnwrappedSignals,
  TypedDebugElement,
} from '../types';
import { isNgtxQuerySelector } from '../utility';
import { keysOf } from '../utility/object.utilities';
import { valueOf } from '../utility/signals';
import { getClassName } from '../utility/string.utilities';
import { NgtxScenarioTestIsAssertionNegated } from './symbols';
import {
  ComponentFixtureRef,
  NgtxScenarioTestingHarnessExtensionFn,
  NgtxTestingFrameworkAdapter,
  ScenarioTestCaseGeneratorFn,
  SetupInstruction,
  TestActionFn,
  TestScenarioOptions,
} from './types';

// ------------------------------------------------------------------------------------------------
// hint: scenario testing user-initialization is done here: <project-root>/library/ngtx.ts
// ------------------------------------------------------------------------------------------------

export class ScenarioTestingEnvironment<Component> {
  readonly #fixtureRef: ComponentFixtureRef<Component>;

  constructor(
    public readonly testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
    fixtureRef: ComponentFixtureRef<Component>,
  ) {
    this.#fixtureRef = fixtureRef;
  }

  public readonly addTestScenario = Object.assign(
    (description: string) =>
      new TestScenario<Component>(
        description,
        this.#fixtureRef,
        this.testingFrameworkAdapter,
      ),
    {
      only: (description: string) =>
        new TestScenario<Component>(
          description,
          this.#fixtureRef,
          this.testingFrameworkAdapter,
          true,
        ),
    },
  );
}

export class TestScenario<Component> {
  #fixtureRef: ComponentFixtureRef;
  #testingFrameworkAdapter: NgtxTestingFrameworkAdapter;
  #setupFns: TestActionFn<Component>[] = [];
  #afterSetupFns: TestActionFn<Component>[] = [];

  constructor(
    public readonly description: string,
    fixtureRef: ComponentFixtureRef,
    testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
    public readonly isFocusedTest = false,
  ) {
    this.#fixtureRef = fixtureRef;
    this.#testingFrameworkAdapter = testingFrameworkAdapter;
  }

  public setup(...setupInstructions: SetupInstruction<Component>[]) {
    const setupFns = setupInstructions
      .filter((e) => e.phase === 'setup')
      .map((e) => e.run);
    const afterSetupFns = setupInstructions
      .filter((e) => e.phase === 'afterSetup')
      .map((e) => e.run);

    this.#setupFns = [...this.#setupFns, ...setupFns];
    this.#afterSetupFns = [...this.#afterSetupFns, ...afterSetupFns];

    return this;
  }

  public expect(...tests: TestActionFn<any>[]) {
    const { describe, fdescribe, beforeEach } = this.#testingFrameworkAdapter;
    const describeFn = this.isFocusedTest ? fdescribe : describe;

    describeFn(this.description, () => {
      beforeEach(async () => {
        for (const setup of this.#setupFns) {
          await setup({
            fixtureRef: this.#fixtureRef,
            query: this.#query,
          });
        }

        for (const afterSetup of this.#afterSetupFns) {
          await afterSetup({
            fixtureRef: this.#fixtureRef,
            query: this.#query,
          });
        }
      });

      // hint: immediately call test generator fns to add tests
      for (const test of tests) {
        test({
          fixtureRef: this.#fixtureRef,
          query: this.#query,
        });
      }
    });
  }

  readonly #query = <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
  ): TypedDebugElement<Html, Component> => {
    if (target == undefined) {
      return this.#fixtureRef().debugElement;
    }

    if (typeof target === 'string') {
      const selector = isNgtxQuerySelector(target)
        ? `[data-ngtx="${target}"]`.replace('ngtx_', '')
        : target;

      return this.#fixtureRef().debugElement.query(By.css(selector));
    }

    return this.#fixtureRef().debugElement.query(By.directive(target));
  };
}

export class ScenarioTestingHarness<Html extends HTMLElement, Component> {
  [NgtxScenarioTestIsAssertionNegated] = false;

  constructor(
    protected readonly queryTarget?: QueryTarget<Component>,
    protected readonly options?: TestScenarioOptions,
  ) {}

  public get isAssertionNegated() {
    return this[NgtxScenarioTestIsAssertionNegated];
  }

  public get displayName() {
    if (this.options?.displayName) {
      return this.options?.displayName;
    }

    return typeof this.queryTarget === 'string'
      ? isNgtxQuerySelector(this.queryTarget)
        ? this.queryTarget.replace('ngtx_', '')
        : this.queryTarget
      : getClassName(this.queryTarget);
  }

  public readonly not: Omit<typeof this, 'not'> = new Proxy(this, {
    get: (_, property) => {
      // TODO: docs: document that constructors of Harnesses are not allowed to be overridden!
      const harnessConstructor = this.constructor as any;
      const optionsClone = { ...this.options };
      const target = new harnessConstructor(this.queryTarget, optionsClone);

      target[NgtxScenarioTestIsAssertionNegated] =
        !this[NgtxScenarioTestIsAssertionNegated];

      return (target as any)[property];
    },
  });

  public toBeFound(): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} found`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target).toBeFalsy();
        } else {
          expect(target).toBeTruthy();
        }
      });
    };
  }

  public toBeMissing(): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} missing`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target).toBeTruthy();
        } else {
          expect(target).toBeFalsy();
        }
      });
    };
  }

  public toContainText(text: string): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not contain' : 'contain';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} text "${text}"`, () => {
        const target = query(this.queryTarget);

        if (this.isAssertionNegated) {
          expect(target.nativeElement.textContent).not.toContain(text);
        } else {
          expect(target.nativeElement.textContent).toContain(text);
        }
      });
    };
  }

  public toBeEnabled(value = true): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not be' : 'be';
    const state = value ? 'enabled' : 'disabled';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} ${state}`, () => {
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
  ): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not have' : 'have';

    return ({ query }) => {
      const objectKeys = Object.keys(stateDef) as (keyof Component)[];
      for (const propertyName of objectKeys) {
        const propertyNameAsString = propertyName.toString();

        it(`[${this.displayName}] should ${verb} correct value for property "${propertyNameAsString}"`, () => {
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

  public toHaveStyle(
    styleDef: Partial<CSSStyleDeclaration>,
  ): ScenarioTestCaseGeneratorFn {
    const verb = this.isAssertionNegated ? 'not have' : 'have';

    return ({ query }) => {
      const objectKeys = keysOf(styleDef);

      for (const propertyName of objectKeys) {
        const propertyNameAsString = propertyName.toString();

        it(`[${this.displayName}] should ${verb} correct value for style-property "${propertyNameAsString}"`, () => {
          const target = query(this.queryTarget);
          const styleValue = target.nativeElement.style[propertyName];

          if (this.isAssertionNegated) {
            expect(styleValue).not.toEqual(styleDef[propertyName]);
          } else {
            expect(styleValue).toEqual(styleDef[propertyName]);
          }
        });
      }
    };
  }

  public to(
    ...testAssertions: NgtxScenarioTestingHarnessExtensionFn<Html, Component>[]
  ): ScenarioTestCaseGeneratorFn {
    return (env) =>
      testAssertions.forEach((assertion) =>
        assertion({
          ...env,
          targetRef: () => env.query(this.queryTarget),
          displayName: this.displayName,
          isAssertionNegated: this.isAssertionNegated,
        }),
      );
  }
}
