import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FindingOptions } from '../declarative-testing/lib';
import {
  QueryTarget,
  StateWithUnwrappedSignals,
  TypedDebugElement,
} from '../types';
import {
  adaptExpectedValuesToFoundTargets,
  asArray,
  getClassName,
  isNgtxQuerySelector,
  keysOf,
  valueOf,
} from '../utility';
import { withChangeDetectionAfterSetup } from './lib';
import {
  NgtxScenarioTestIsAssertionNegated,
  NgtxScenarioTestTargetFilter,
} from './symbols';
import {
  ComponentFixtureRef,
  NgtxChildComponentTestCaseGeneratorFn,
  NgtxScenarioTestingHarnessExtensionFn,
  NgtxTestingFrameworkAdapter,
  ScenarioTestCaseGeneratorFn,
  ScenarioTestingHarnessExtensionContext,
  ScenarioTestingHarnessOptions,
  ScenarioTestingHarnessWithoutFilters,
  SetupInstruction,
  TargetFilter,
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
    (description: string, opts: TestScenarioOptions = {}) =>
      new TestScenario<Component>(
        description,
        this.#fixtureRef,
        this.testingFrameworkAdapter,
        false,
        opts,
      ),
    {
      only: (description: string, opts: TestScenarioOptions = {}) =>
        new TestScenario<Component>(
          description,
          this.#fixtureRef,
          this.testingFrameworkAdapter,
          true,
          opts,
        ),
    },
  );

  public readonly addChildComponentTest = Object.assign(
    <Component>(
      targetHarness: ScenarioTestingHarnessWithoutFilters<any, Component>,
    ) =>
      new ChildComponentTest<Component>(targetHarness, this.#fixtureRef, false),
    {
      only: (
        targetHarness: ScenarioTestingHarnessWithoutFilters<any, Component>,
      ) =>
        new ChildComponentTest<Component>(
          targetHarness,
          this.#fixtureRef,
          true,
        ),
    },
  );
}

class TestBase {
  constructor(
    protected readonly fixtureRef: ComponentFixtureRef,
    public readonly isFocusedTest: boolean,
  ) {}

  protected readonly query = <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
    filter: TargetFilter<Html, Component>,
  ): TypedDebugElement<Html, Component>[] => {
    if (target == undefined) {
      return [this.fixtureRef().debugElement].filter(filter.filter);
    }

    let searchMethod: Predicate<DebugElement>;

    if (typeof target === 'string') {
      const selector = isNgtxQuerySelector(target)
        ? `[data-ngtx="${target}"]`.replace('ngtx_', '')
        : target;

      searchMethod = By.css(selector);
    } else {
      searchMethod = By.directive(target);
    }

    const results = this.fixtureRef().debugElement.queryAll(searchMethod);
    return results.length > 0 ? results.filter(filter.filter) : (null as any);
  };
}

export class TestScenario<Component> extends TestBase {
  #testingFrameworkAdapter: NgtxTestingFrameworkAdapter;
  #options: TestScenarioOptions;
  #setupFns: TestActionFn<Component>[] = [];
  #afterSetupFns: TestActionFn<Component>[] = [];

  constructor(
    public readonly description: string,
    fixtureRef: ComponentFixtureRef,
    testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
    isFocusedTest = false,
    opts: TestScenarioOptions = {},
  ) {
    super(fixtureRef, isFocusedTest);
    this.#testingFrameworkAdapter = testingFrameworkAdapter;
    this.#options = opts;
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
            fixtureRef: this.fixtureRef,
            query: this.query,
          });
        }

        if (!this.#options.skipInitialChangeDetection) {
          this.#afterSetupFns.push(withChangeDetectionAfterSetup().run);
        }

        for (const afterSetup of this.#afterSetupFns) {
          await afterSetup({
            fixtureRef: this.fixtureRef,
            query: this.query,
          });
        }
      });

      // hint: immediately call test generator fns to add tests
      for (const test of tests) {
        test({
          fixtureRef: this.fixtureRef,
          query: this.query,
        });
      }
    });
  }
}

export class ChildComponentTest<Component> extends TestBase {
  constructor(
    protected readonly targetHarness: ScenarioTestingHarnessWithoutFilters<
      any,
      Component
    >,
    fixtureRef: ComponentFixtureRef,
    isFocussedTest: boolean,
  ) {
    super(fixtureRef, isFocussedTest);
  }

  public readonly to = (
    ...tests: NgtxChildComponentTestCaseGeneratorFn<HTMLElement, Component>[]
  ) => {
    describe(this.targetHarness['displayName'], () => {
      for (const test of tests) {
        const target = this.targetHarness as ScenarioTestingHarness<
          any,
          Component
        >;

        const context: ScenarioTestingHarnessExtensionContext<
          HTMLElement,
          Component
        > = {
          displayName: target['displayName'],
          isAssertionNegated: target['isAssertionNegated'],
          fixtureRef: this.fixtureRef,
          query: this.query,
          targetRef: () => this.query(target['queryTarget'], target['filter']),
        };

        const testGeneratorFnOrVoid = test({
          ...this.targetHarness,
          ...context,
        });

        /* 
            hint: we also pack the scenario-testing harness into the evn, so the user could call e.g. 

              expect(the.button).to({ toBeEnabled }) => toBeEnabled())
            
            which returns a TestingScenarioExtensionFn, which has to be called with the context object again,
            to add their tests.

            If the user passes in an own TestingScenarioExtensionFn, the maybeTestGeneratorFn variable is expected to be void / undefined,
            e.g.

              expect(the.button).to(beFocussed())
        */
        if (typeof testGeneratorFnOrVoid === 'function') {
          testGeneratorFnOrVoid(context);
        }
      }
    });
  };
}

export class ScenarioTestingHarness<
  Html extends HTMLElement = HTMLElement,
  Component = any,
> {
  [NgtxScenarioTestIsAssertionNegated] = false;
  [NgtxScenarioTestTargetFilter]?: TargetFilter<Html, Component>;

  static forAll<Html extends HTMLElement = HTMLElement, Component = any>(
    queryTarget?: QueryTarget<Component>,
    options?: ScenarioTestingHarnessOptions,
  ) {
    return new ScenarioTestingHarness<Html, Component>(queryTarget, options);
  }

  static for<Html extends HTMLElement = HTMLElement, Component = any>(
    queryTarget?: QueryTarget<Component>,
    options?: ScenarioTestingHarnessOptions,
  ): ScenarioTestingHarnessWithoutFilters<Html, Component> {
    const harness = new ScenarioTestingHarness<Html, Component>(
      queryTarget,
      options,
    ).first();

    // hint: remove filter name (":first"), so that it does not appear in displayName, as there is obviously only one target existing (thus using ".for" instead of ".forAll"):
    if (harness[NgtxScenarioTestTargetFilter]) {
      harness[NgtxScenarioTestTargetFilter].name = '';
    }

    return harness;
  }

  private constructor(
    protected readonly queryTarget?: QueryTarget<Component>,
    protected readonly options?: ScenarioTestingHarnessOptions,
  ) {}

  public get isAssertionNegated() {
    return this[NgtxScenarioTestIsAssertionNegated];
  }

  public get displayName() {
    if (this.options?.displayName) {
      return this.options.displayName + this.filter.name;
    }

    const name =
      typeof this.queryTarget === 'string'
        ? isNgtxQuerySelector(this.queryTarget)
          ? this.queryTarget.replace('ngtx_', '')
          : this.queryTarget
        : getClassName(this.queryTarget);

    return name + this.filter.name;
  }

  public readonly not: Omit<
    ScenarioTestingHarnessWithoutFilters<Html, Component>,
    'not'
  > = new Proxy(this, {
    get: (_, property) => {
      const harnessClone = this.clone();

      harnessClone[NgtxScenarioTestIsAssertionNegated] =
        !this[NgtxScenarioTestIsAssertionNegated];

      return (harnessClone as any)[property];
    },
  });

  //#region filter functions
  public readonly nth = (
    nth: number,
  ): ScenarioTestingHarnessWithoutFilters<Html, Component> => {
    this.checkNoFilterSet();

    const harnessClone = this.clone();
    harnessClone[NgtxScenarioTestTargetFilter] = {
      name: `:nth(${nth})`,
      filter: (_, index) => index === nth - 1,
    };

    return harnessClone;
  };
  public readonly first = (): ScenarioTestingHarnessWithoutFilters<
    Html,
    Component
  > => {
    this.checkNoFilterSet();

    const harnessClone = this.clone();
    harnessClone[NgtxScenarioTestTargetFilter] = {
      name: `:first`,
      filter: (_, index) => index === 0,
    };

    return harnessClone;
  };
  public readonly last = (): ScenarioTestingHarnessWithoutFilters<
    Html,
    Component
  > => {
    this.checkNoFilterSet();

    const harnessClone = this.clone();
    harnessClone[NgtxScenarioTestTargetFilter] = {
      name: `:last`,
      filter: (_, index, list) => index === list.length - 1,
    };

    return harnessClone;
  };
  public readonly range = (
    from: number,
    to?: number,
  ): ScenarioTestingHarnessWithoutFilters<Html, Component> => {
    this.checkNoFilterSet();

    const harnessClone = this.clone();
    harnessClone[NgtxScenarioTestTargetFilter] = {
      name: `:range(${from} to ${to ?? 'end'})`,
      filter: (_, index, list) =>
        index >= from - 1 && index <= (to ?? list.length) - 1,
    };

    return harnessClone;
  };
  public readonly where = (
    filter: TargetFilter<Html, Component>,
  ): ScenarioTestingHarnessWithoutFilters<Html, Component> => {
    this.checkNoFilterSet();

    const harnessClone = this.clone();
    harnessClone[NgtxScenarioTestTargetFilter] = filter;

    return harnessClone;
  };
  //#endregion

  protected get filter() {
    return (
      this[NgtxScenarioTestTargetFilter] ?? { name: '', filter: () => true }
    );
  }

  public toBeFound = (
    opts: FindingOptions = {},
  ): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} found`, () => {
        const targets = query(this.queryTarget, this.filter);

        if (this.isAssertionNegated) {
          expect(targets).toBeFalsy();
        } else {
          const foundTimes = opts.times ?? targets.length;
          expect(targets).toBeTruthy();
          expect(targets.length).toBe(foundTimes);
        }
      });
    };
  };

  public toBeMissing = (): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not be' : 'be';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} missing`, () => {
        const target = query(this.queryTarget, this.filter);

        if (this.isAssertionNegated) {
          expect(target).toBeTruthy();
        } else {
          expect(target).toBeFalsy();
        }
      });
    };
  };

  public toContainText = (
    text: string | string[],
  ): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not contain' : 'contain';

    return ({ query }) => {
      const texts = asArray(text);

      for (const text of texts) {
        it(`[${this.displayName}] should ${verb} text ${text}`, () => {
          const targets = query(this.queryTarget, this.filter);
          expect(targets).toBeTruthy();

          const expectedTexts = adaptExpectedValuesToFoundTargets({
            valueOrValues: texts,
            targets,
          });

          targets.forEach((target, index) => {
            if (this.isAssertionNegated) {
              expect(target.nativeElement.textContent).not.toContain(
                expectedTexts[index],
              );
            } else {
              expect(target.nativeElement.textContent).toContain(
                expectedTexts[index],
              );
            }
          });
        });
      }
    };
  };

  public toBeEnabled = (value = true): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not be' : 'be';
    const state = value ? 'enabled' : 'disabled';

    return ({ query }) => {
      it(`[${this.displayName}] should ${verb} ${state}`, () => {
        const targets = query(this.queryTarget, this.filter);
        expect(targets).toBeTruthy();

        for (const target of targets) {
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
        }
      });
    };
  };

  public toHaveState = (
    stateOrStates:
      | StateWithUnwrappedSignals<Component>
      | StateWithUnwrappedSignals<Component>[],
  ): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not have' : 'have';

    return ({ query }) => {
      const states = asArray(stateOrStates);

      for (const state of states) {
        for (const propertyName of keysOf(state)) {
          const propertyNameAsString = propertyName.toString();

          it(`[${this.displayName}] should ${verb} correct value for property "${propertyNameAsString}"`, () => {
            const targets = query(this.queryTarget, this.filter);
            expect(targets).toBeTruthy();

            const expectedStates = adaptExpectedValuesToFoundTargets({
              valueOrValues: states,
              targets,
            });

            targets.forEach((target, index) => {
              const state = expectedStates[index];
              const propertyValue = target.componentInstance[propertyName];
              const rawValue = valueOf(propertyValue);

              if (this.isAssertionNegated) {
                expect(rawValue).not.toEqual(state[propertyName]);
              } else {
                expect(rawValue).toEqual(state[propertyName]);
              }
            });
          });
        }
      }
    };
  };

  public toHaveStyle = (
    styleDef: Partial<CSSStyleDeclaration> | Partial<CSSStyleDeclaration>[],
  ): ScenarioTestCaseGeneratorFn => {
    const verb = this.isAssertionNegated ? 'not have' : 'have';

    return ({ query }) => {
      const styleDefs = asArray(styleDef);

      for (const styleDef of styleDefs) {
        const objectKeys = keysOf(styleDef);

        for (const propertyName of objectKeys) {
          const propertyNameAsString = propertyName.toString();

          it(`[${this.displayName}] should ${verb} correct value for style-property "${propertyNameAsString}"`, () => {
            const targets = query(this.queryTarget, this.filter);
            expect(targets).toBeTruthy();

            const expectedStyles = adaptExpectedValuesToFoundTargets({
              valueOrValues: styleDefs,
              targets,
            });

            targets.forEach((target, index) => {
              const style = expectedStyles[index];
              const styleValue = target.nativeElement.style[propertyName];

              if (this.isAssertionNegated) {
                expect(styleValue).not.toEqual(style[propertyName]);
              } else {
                expect(styleValue).toEqual(style[propertyName]);
              }
            });
          });
        }
      }
    };
  };

  public readonly to = (
    ...testAssertions: NgtxScenarioTestingHarnessExtensionFn<Html, Component>[]
  ): ScenarioTestCaseGeneratorFn => {
    return (env) =>
      testAssertions.forEach((assertion) =>
        assertion({
          ...env,
          targetRef: () => env.query(this.queryTarget, this.filter),
          displayName: this.displayName,
          isAssertionNegated: this.isAssertionNegated,
        }),
      );
  };

  protected clone(): ScenarioTestingHarness<Html, Component> {
    const harnessConstructor = this.constructor as any;
    const optionsClone = { ...this.options };
    const target = new harnessConstructor(this.queryTarget, optionsClone);

    return target;
  }

  protected checkNoFilterSet() {
    if (this[NgtxScenarioTestTargetFilter] != undefined) {
      throw new Error(
        `[${this.displayName}] Filters like "nth", "first" or "range" can only be used once per harness instance.`,
      );
    }
  }
}
