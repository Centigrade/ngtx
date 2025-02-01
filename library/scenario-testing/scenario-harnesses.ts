import { isSignal, untracked } from '@angular/core';
import { Type } from 'ng-mocks';
import { HtmlPropertiesOf } from '../declarative-testing/types';
import { TypedDebugElement, UnwrapSignals } from '../types';
import { isNgtxQuerySelector } from '../utility';
import { NgtxScenarioTestEnvironment } from './scenario-testing';
import { NgtxScenarioTestIsAssertionNegated } from './symbols';
import { ComponentFixtureRef, NgtxScenarioTestAssertionFn } from './types';

export class ScenarioTestingHarnessBase<Html extends HTMLElement, Component> {
  private [NgtxScenarioTestIsAssertionNegated] = false;

  public get isAssertionNegated() {
    return this[NgtxScenarioTestIsAssertionNegated];
  }

  public readonly not: Omit<typeof this, 'not'> = new Proxy(this, {
    get: (_, property) => {
      // TODO: docs: document that constructors of Harnesses are not allowed to be overridden!
      const harnessConstructor = this.constructor as any;
      const target = new harnessConstructor(
        this.selector,
        this.testEnv,
        this.name,
      );

      target[NgtxScenarioTestIsAssertionNegated] =
        !this[NgtxScenarioTestIsAssertionNegated];

      return (target as any)[property];
    },
  });

  constructor(
    public readonly selector: string | Type<Component>,
    private readonly testEnv: NgtxScenarioTestEnvironment<any>,
    public readonly name = typeof selector === 'string'
      ? isNgtxQuerySelector(selector)
        ? selector.replace('ngtx_', '')
        : selector
      : selector.name,
  ) {}

  public fixtureRef!: ComponentFixtureRef;

  /**
   * Adds user defined test cases to the current scenario.
   */
  public addTests(userDefinedTests: () => unknown) {
    return (fxRef: ComponentFixtureRef) => {
      // set the fixture ref in order to enable code running in user defined tests to access the fixture via its ref:
      this.fixtureRef = fxRef;
      // add a set of tests (e.g. someHarness.toBeFound() adds 1 test)
      userDefinedTests();
    };
  }

  get debugElement() {
    return this.testEnv.query(this.selector as any)() as TypedDebugElement<
      Html,
      Component
    >;
  }
}

export class ScenarioTestingHarness<
  Html extends HTMLElement,
  Component,
> extends ScenarioTestingHarnessBase<Html, Component> {
  public toBeFound() {
    return this.addTests(() => {
      if (this.isAssertionNegated) {
        it(`${this.name} should not be found`, () => {
          expect(this.debugElement).not.toBeTruthy();
        });
      } else {
        it(`${this.name} should be found`, () => {
          expect(this.debugElement).toBeTruthy();
        });
      }
    });
  }
  public toBeMissing() {
    return this.addTests(() => {
      if (this.isAssertionNegated) {
        it(`${this.name} should not be missing`, () => {
          expect(this.debugElement).not.toBeFalsy();
        });
      } else {
        it(`${this.name} should be missing`, () => {
          expect(this.debugElement).toBeFalsy();
        });
      }
    });
  }
  public toHaveText(
    text: string,
    options?: { ignoreCase?: boolean; trim?: boolean },
  ) {
    const ignoreCase = options?.ignoreCase ?? false;
    const trim = options?.trim ?? false;

    let description = this.isAssertionNegated
      ? `${this.name} should not have text "${text}"`
      : `${this.name} should have text "${text}"`;

    if (ignoreCase && trim) {
      description += ' (ignoring case and trimmed)';
    } else if (ignoreCase) {
      description += ' (ignoring case)';
    } else if (trim) {
      description += ' (trimmed)';
    }

    return this.addTests(() => {
      it(description, () => {
        let textContent = this.debugElement.nativeElement.textContent ?? '';

        if (ignoreCase) {
          textContent = textContent.toLowerCase();
          text = text.toLowerCase();
        }
        if (trim) {
          textContent = textContent.trim();
        }

        if (this.isAssertionNegated) {
          expect(textContent).not.toBe(text);
        } else {
          expect(textContent).toBe(text);
        }
      });
    });
  }
  public toContainText(text: string, options?: { ignoreCase?: boolean }) {
    const ignoreCase = options?.ignoreCase ?? false;

    let description = this.isAssertionNegated
      ? `${this.name} should not contain text "${text}"`
      : `${this.name} should contain text "${text}"`;

    if (ignoreCase) {
      description += ' (ignoring case)';
    }

    return this.addTests(() => {
      it(description, () => {
        let textContent = this.debugElement.nativeElement.textContent ?? '';

        if (ignoreCase) {
          textContent = textContent.toLowerCase();
          text = text.toLowerCase();
        }

        if (this.isAssertionNegated) {
          expect(textContent).not.toContain(text);
        } else {
          expect(textContent).toContain(text);
        }
      });
    });
  }
  public toHaveClass(...classNames: string[]) {
    return this.addTests(() => {
      classNames.forEach((className) => {
        const description = this.isAssertionNegated
          ? `${this.name} should not have class "${className}"`
          : `${this.name} should have class "${className}"`;

        it(description, async () => {
          const classList = this.debugElement.nativeElement.classList;

          if (this.isAssertionNegated) {
            expect(classList.contains(className)).toBe(false);
          } else {
            expect(classList.contains(className)).toBe(true);
          }
        });
      });
    });
  }
  public toHaveStyles(styles: Partial<CSSStyleDeclaration>) {
    return this.addTests(() => {
      Object.entries(styles).forEach(([key, value]) => {
        const description = this.isAssertionNegated
          ? `${this.name} should not have style "${key}: ${value}"`
          : `${this.name} should have style "${key}: ${value}"`;

        it(description, () => {
          const styles = this.debugElement.nativeElement.style;

          if (this.isAssertionNegated) {
            expect((styles as any)[key]).not.toBe(value);
          } else {
            expect((styles as any)[key]).toBe(value);
          }
        });
      });
    });
  }
  public toHaveState(expectedState: Partial<UnwrapSignals<Component>>) {
    return this.addTests(() => {
      Object.entries(expectedState).forEach(([property, expectedValue]) => {
        const description = this.isAssertionNegated
          ? `${this.name} should have the property "${property}" not having the value ${expectedValue}`
          : `${this.name} should have the property "${property}" with value ${expectedValue}`;

        it(description, () => {
          untracked(() => {
            const value = (this.debugElement.componentInstance as any)[
              property
            ];
            const unwrappedValue = isSignal(value) ? value() : value;

            if (this.isAssertionNegated) {
              expect(unwrappedValue).not.toEqual(expectedValue);
            } else {
              expect(unwrappedValue).toEqual(expectedValue);
            }
          });
        });
      });
    });
  }
  public toHaveAttributes(expectedAttributes: HtmlPropertiesOf<Html>) {
    return this.addTests(() => {
      Object.entries(expectedAttributes).forEach(
        ([attribute, expectedValue]) => {
          const description = this.isAssertionNegated
            ? `${this.name} should have the attribute "${attribute}" not having the value "${expectedValue}"`
            : `${this.name} should have the attribute "${attribute}" with value "${expectedValue}"`;

          it(description, () => {
            const value = (this.debugElement.nativeElement as any)[attribute];

            if (this.isAssertionNegated) {
              expect(value).not.toEqual(String(expectedValue));
            } else {
              expect(value).toEqual(String(expectedValue));
            }
          });
        },
      );
    });
  }
  public to(...assertions: NgtxScenarioTestAssertionFn<Html, Component>[]) {
    const addTests: typeof this.addTests = this.addTests.bind(this);
    return assertions.map((assertion) => assertion(addTests, this));
  }
}
