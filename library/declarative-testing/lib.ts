import { ChangeDetectorRef, ProviderToken } from '@angular/core';
import { tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NgtxElement } from '../core';
import { Maybe } from '../types';
import { createExtension } from './declarative-testing';
import {
  CallBaseOptions,
  CallOptions,
  CallSiteResolver,
  CssClass,
  ElementListRef,
  EmissionOptions,
  EventDispatcher,
  Events,
  ExtensionFn,
  HtmlPropertiesOf,
  IHaveLifeCycleHook,
  PropertiesOf,
  TargetRef,
  Token,
} from './types';
import {
  asArray,
  asNgtxElementListRef,
  checkListsHaveSameSize,
  expandValueToArrayWithLength,
  getAllProperties,
  tryResolveTarget,
} from './utility';

//#region target resolvers
export const nativeEvent =
  <Html extends HTMLElement>(
    eventNameOrInstance: Events<Html, unknown> | Event,
  ) =>
  (subject: NgtxElement<Html, any>) => {
    const event =
      typeof eventNameOrInstance === 'string'
        ? new Event(eventNameOrInstance)
        : eventNameOrInstance;

    subject.nativeElement.dispatchEvent(event);
  };

export const componentMethod = <T>(element: NgtxElement<HTMLElement, T>) => {
  return element.componentInstance;
};

export const classMember =
  <T, P extends keyof T = keyof T>(name: P) =>
  (element: NgtxElement<HTMLElement, T>) => {
    return element.componentInstance[name];
  };

export const nativeMethod = <T extends HTMLElement>(
  element: NgtxElement<T, any>,
) => {
  return element.nativeElement;
};

export const injected =
  <T>(type: Token<T>) =>
  (element: NgtxElement<HTMLElement, any>): T => {
    return element.injector.get(type);
  };
//#endregion

//#region convenience extensions
export const debug = <Html extends HTMLElement, Type>(
  opts: DebugOptions = {},
): ExtensionFn<Html, Type> =>
  createExtension((_, { addPredicate }, fixture) => {
    addPredicate(() => {
      fixture.rootElement.debug();

      if (opts.stateOf) {
        const targets = tryResolveTarget(
          asNgtxElementListRef(opts.stateOf),
          'debug',
        );

        targets.forEach((target, index) => {
          const props = stripAngularMetaProperties(target.componentInstance);
          console.log(
            `------- State of ${target.componentInstance.constructor.name} #${
              index + 1
            } --------`,
            '\n\n',
            props,
            '\n\n',
          );
        });
      }

      if (opts.attributesOf) {
        const targets = tryResolveTarget(
          asNgtxElementListRef(opts.attributesOf),
          'debug',
        );

        targets.forEach((target, index) => {
          const attributes = getAllProperties(target.nativeElement);
          const wantedAttributes = opts.attributeFilter
            ? attributes.filter((a) => opts.attributeFilter!(a.toLowerCase()))
            : attributes;
          const output = wantedAttributes.reduce(
            (result, current) => ({
              ...result,
              [current]: target.nativeElement[current],
            }),
            {},
          );

          console.log(
            `------- Attributes of ${target.nativeElement.constructor.name} #${
              index + 1
            } --------`,
            '\n\n',
            // maybeFiltered
            //   .map(([name, value]) => `${name}: ${value}`)
            //   .join('\n\t'),
            // '\n\n',
          );
          console.log(output);
          console.log('\n\n');
        });
      }
    });
  });

export const clicked = <Html extends HTMLElement, Type>(
  opts: ClickOptions = {},
): ExtensionFn<Html, Type> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      tryResolveTarget(targets, clicked.name).forEach((subject) => {
        const times = opts.times ?? 1;

        for (let i = 0; i < times; i++) {
          if (opts.nativeClick) {
            subject.nativeElement.click();
          } else {
            subject.triggerEvent('click', opts.eventArgs);
          }
        }
      });

      fixture.detectChanges();
    });
  });
//#endregion

//#region predicate extensions
/**
 * Resolves the specified token from Angular's dependency injection and provides an API to further
 * work with that resolved instance. E.g. allows to change state or emit values on `Subject`s
 * (see examples below).
 *
 * ---
 * ### Examples
 *
 * ~~~ts
 * // setting state:
 * When(host).has(provider(AuthService).withState({ user: { name: 'Ann' } }))...
 * // emitting data on a subject located on that token:
 * When(host).has(provider(AuthService).emittingOnProperty$('user$', userObj))...
 * // emitting data on a token which itself is a kind of rxjs Subject:
 * When(host).has(provider(CurrentUser$).emitting$(userObj))...
 * ~~~
 *
 * ---
 * @param provider The token to resolve from dependency injection and then work with.
 * @returns An api that allows to work with the resolved token.
 */
export const provider = <T extends {}>(provider: ProviderToken<T>) => ({
  /**
   * Sets the specified state on the resolved token instance and calls the change detection afterwards.
   *
   * ---
   * ### Example
   *
   * ~~~ts
   * // setting state:
   * When(host).has(provider(AuthService).withState({ isLoggedIn: true }))...
   * ~~~
   * ---
   * @param stateDef The state to set on the resolved token instance.
   */
  withState: (stateDef: Partial<PropertiesOf<T>>) =>
    createExtension((target, { addPredicate }, fixture) => {
      addPredicate(() => {
        target().forEach((host) => {
          const instance = host.injector.get(provider);

          for (const prop in stateDef) {
            (instance as any)[prop] = stateDef[prop];
          }
        });

        fixture.detectChanges();
      });
    }),
  /**
   * Emits the given data on the specified property (which must be some kind of rxjs `Subject`)
   * and calls change detection after each emission.
   *
   * ---
   * ### Example
   *
   * ~~~ts
   * // emitting data on a subject located on that token:
   * When(host).has(provider(AuthService).emittingOnProperty$('isLoggedIn$', true))...
   * ~~~
   *
   * ---
   * @param property The name of the property to emit data on (must be some kind of `Subject`)
   * @param value (Optional) The value that should be emitted on the property.
   */
  emittingOnProperty$: <I extends keyof T>(property: I, value?: any) =>
    createExtension(
      (
        targets: ElementListRef<HTMLElement, any>,
        { addPredicate },
        fixture,
      ) => {
        addPredicate(() => {
          targets().forEach((target) => {
            const instance = target.injector.get(provider);
            const subject = instance[property] as unknown as Subject<T[I]>;

            subject.next(value);
            fixture.detectChanges();
          });
        });
      },
    ),
  /**
   * Takes the given value and emits it on the resolved token instance, which must be some kind of rxjs `Subject`
   * and calls change detection after each emission.
   *
   * ---
   * ### Example
   *
   * ~~~ts
   * // emitting data on a token which itself is a kind of rxjs Subject:
   * When(host).has(provider(CurrentUser$).emitting$({
   *  name: 'Ann Smith',
   *  email: 'ann.smith@company.com',
   * }))...
   * ~~~
   *
   * ---
   * @param value The value to emit on the token (that itself must be some kind of rxjs `Subject`).
   */
  emitting$: (value?: any) =>
    createExtension(
      (
        targets: ElementListRef<HTMLElement, any>,
        { addPredicate },
        fixture,
      ) => {
        addPredicate(() => {
          targets().forEach((target) => {
            const instance = target.injector.get(provider);
            const subject = instance as unknown as Subject<T>;

            subject.next(value);
            fixture.detectChanges();
          });
        });
      },
    ),
});

export const detectChanges = (opts: DetectChangesOptions = {}) =>
  createExtension((targets, { addPredicate }, fx) => {
    addPredicate(() => {
      tryResolveTarget(targets, detectChanges.name).forEach((subject) => {
        if (opts.viaChangeDetectorRef) {
          subject.injector.get(ChangeDetectorRef).detectChanges();
        } else {
          fx.detectChanges();
        }
      });
    });
  });

export const callLifeCycleHook = <Html extends HTMLElement, Component>(
  hooks: LifeCycleHookCalls<Component>,
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      tryResolveTarget(targets, callLifeCycleHook.name).forEach((subject) => {
        const host = subject.componentInstance as unknown as IHaveLifeCycleHook;

        if (hooks.ngOnChanges) {
          const args = hooks.ngOnChanges === true ? {} : hooks.ngOnChanges;
          host.ngOnChanges!(args);
        }
        if (hooks.ngOnInit) {
          host.ngOnInit!();
        }
        if (hooks.ngAfterContentInit) {
          host.ngAfterContentInit!();
        }
        if (hooks.ngAfterViewInit) {
          host.ngAfterViewInit!();
        }
        if (hooks.ngOnDestroy) {
          host.ngOnDestroy!();
        }

        // due to hook-calls there could be changes in state
        fixture.detectChanges();
      });
    });
  });

export const waitFakeAsync = (durationOrMs: 'animationFrame' | number = 0) =>
  createExtension((_, { addPredicate }, fx) => {
    addPredicate(() => {
      const duration = durationOrMs === 'animationFrame' ? 16 : durationOrMs;
      tick(duration);
      fx.detectChanges();
    });
  });

export const call = <Html extends HTMLElement, Component, Out>(
  resolver: CallSiteResolver<Html, Component, Out>,
  methodName: keyof Out,
  args: any[] = [],
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      tryResolveTarget(targets, call.name).forEach((target) => {
        const token = resolver(target);
        const method = (token as any)[methodName] as Function;
        method.apply(token, args);
      });

      fixture.detectChanges();
    });
  });

export const emit = <Html extends HTMLElement, Type>(
  eventNameOrDispatcher: Events<Html, Type> | EventDispatcher,
  arg?: any,
): ExtensionFn<Html, Type> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      tryResolveTarget(targets, emit.name).forEach((subject) => {
        if (typeof eventNameOrDispatcher === 'function') {
          eventNameOrDispatcher(subject);
        } else {
          subject.triggerEvent(eventNameOrDispatcher as string, arg);
        }
      });

      fixture.detectChanges();
    });
  });

export const attributes = <
  Html extends HTMLElement,
  Target extends Html = Html,
>(
  stateDef: HtmlPropertiesOf<Target> | HtmlPropertiesOf<Target>[],
): ExtensionFn<Html, any> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = tryResolveTarget(targets, attributes.name);
      const states = expandValueToArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = targets()[index];
        const props = Object.entries(state) as [keyof Html, any][];

        props.forEach(([key, value]) => {
          subject.nativeElement[key] = value;
        });

        fixture.detectChanges();
      });
    });
  });

export const state = <T>(
  stateDef: PropertiesOf<T> | PropertiesOf<T>[],
): ExtensionFn<HTMLElement, T> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = tryResolveTarget(targets, state.name);
      const states = expandValueToArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = element[index];
        const props = Object.entries(state) as [keyof T, any][];

        props.forEach(([key, value]) => {
          subject.componentInstance[key] = value;
        });

        fixture.detectChanges();
      });
    });
  });
//#endregion

//#region assertion extensions
export const haveStyle = (
  styles:
    | Partial<CSSStyleDeclaration>
    | Partial<CSSStyleDeclaration | null | undefined>[],
) =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subjects = tryResolveTarget(targets, haveCssClass.name);

      // hint: if single class is given as input, it will be expanded to be checked on all subjects:
      const stylesArray = expandValueToArrayWithLength(subjects.length, styles);

      stylesArray.forEach((styleDef, index) => {
        // hint: allow user to pass null or undefined to skip check
        if (styleDef == null) return;

        const subject = subjects[index];

        Object.entries(styleDef).forEach(([name, value]) => {
          const styleProperty = (subject.nativeElement.style as any)[name];

          if (isAssertionNegated) {
            expect(styleProperty).not.toEqual(value);
          } else {
            expect(styleProperty).toEqual(value);
          }
        });
      });
    });
  });

export const haveCssClass = <Html extends HTMLElement, Component>(
  cssClasses: CssClass | (CssClass | string[])[],
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subjects = tryResolveTarget(targets, haveCssClass.name);
      // hint: if single class is given as input, it will be expanded to be checked on all subjects:
      const classArray = expandValueToArrayWithLength(
        subjects.length,
        cssClasses,
      );

      classArray.forEach((cssClass, index) => {
        // hint: allow user to manually skip items by passing null or undefined
        if (cssClass == null) return;

        const subject = subjects[index];
        const classes = asArray(cssClass);

        classes.forEach((className) => {
          if (isAssertionNegated) {
            expect(subject.nativeElement.classList).not.toContain(className);
          } else {
            expect(subject.nativeElement.classList).toContain(className);
          }
        });
      });
    });
  });

export const beMissing = <Html extends HTMLElement, Component>(): ExtensionFn<
  Html,
  Component
> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      // hint: we do not use "tryResolveTarget" here, as this assertion must allow for not-found-targets:
      const subjects = targets();
      const count = subjects?.length ?? 0;

      if (isAssertionNegated) {
        expect(count).not.toBe(0);
      } else {
        expect(count).toBe(0);
      }
    });
  });

export const beFound = <Html extends HTMLElement, Component>(
  opts: FindingOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      // hint: we do not use "tryResolveTarget" here, as the negated assertion must allow for not-found-targets:
      const subjects = targets();
      const count = subjects?.length ?? 0;

      if (isAssertionNegated) {
        if (opts?.times != null) {
          expect(count).not.toBe(opts.times);
        } else {
          expect(count).not.toBeGreaterThan(0);
        }
      } else {
        if (opts?.times != null) {
          expect(count).toBe(opts.times);
        } else {
          expect(count).toBeGreaterThan(0);
        }
      }
    });
  });

interface haveCalledFn {
  <Html extends HTMLElement, Component, Out>(
    resolver: CallSiteResolver<Html, Component, Out>,
    methodName: keyof Out,
    opts?: CallOptions,
  ): ExtensionFn<Html, Component>;
  <T extends {}>(spy: T, opts?: CallOptions): ExtensionFn<HTMLElement, any>;
}

export const haveCalled: haveCalledFn = <
  Html extends HTMLElement,
  Component,
  Out,
  Spy extends {},
>(
  resolver: CallSiteResolver<Html, Component, Out> | Spy,
  methodName: keyof Out | CallOptions | undefined,
  opts: CallOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, spyOn, isAssertionNegated }) => {
    // signature: resolver, methodName, opts
    if (typeof methodName === 'string') {
      const resolverFn = resolver as Function;
      const resolveTarget = () => {
        // hint: we do not use "tryResolveTarget" here, as the negated assertion must allow for not-found-targets:
        const subject = targets()?.[0];
        return subject ? resolverFn(subject) : undefined!;
      };

      const spy = spyOn(resolveTarget, methodName, opts.whichReturns);
      addAssertion(() => assertCall(spy, opts, isAssertionNegated));
    }
    // signature: spy-instance, opts
    else {
      const spy = resolver as any;
      const opts = (methodName as {}) ?? {};
      addAssertion(() => assertCall(spy, opts, isAssertionNegated));
    }
  });

export const haveEmitted = <Html extends HTMLElement, Component>(
  eventName: Events<Html, Component>,
  opts: EmissionOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { spyOn, addAssertion, isAssertionNegated }) => {
    const resolve = () => {
      // hint: we do not use "tryResolveTarget" here, as this resolver must allow for not-found-targets:
      const subject = targets()?.[0];
      const component: any = subject.componentInstance;

      if (typeof component[eventName]?.emit === 'function') {
        return component[eventName];
      }
    };

    const spy = spyOn(resolve, 'emit');
    addAssertion(() => assertEmission(spy, opts, isAssertionNegated));
  });

export const containText = (
  texts: Maybe<string> | Maybe<string>[] | ((index: number) => string),
): ExtensionFn<HTMLElement, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subjects = tryResolveTarget(targets, containText.name);

      if (typeof texts === 'function') {
        subjects.forEach((subject, index) => {
          const text = texts(index);

          if (isAssertionNegated) {
            expect(subject.textContent()).not.toContain(text);
          } else {
            expect(subject.textContent()).toContain(text);
          }
        });
      } else {
        const textArray = expandValueToArrayWithLength(subjects.length, texts);

        textArray.forEach((text, index) => {
          // allow user to skip items via null or undefined
          if (text == null) return;

          const element = subjects[index];

          if (isAssertionNegated) {
            expect(element.textContent()).not.toContain(text);
          } else {
            expect(element.textContent()).toContain(text);
          }
        });
      }
    });
  });

export const haveText = (
  texts: Maybe<string> | Maybe<string>[] | ((index: number) => string),
): ExtensionFn<HTMLElement, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subjects = tryResolveTarget(targets, haveText.name);

      if (typeof texts === 'function') {
        subjects.forEach((subject, index) => {
          const text = texts(index);

          if (isAssertionNegated) {
            expect(subject.textContent()).not.toEqual(text);
          } else {
            expect(subject.textContent()).toEqual(text);
          }
        });
      } else {
        const textArray = asArray(texts);

        checkListsHaveSameSize('haveText', textArray, subjects);

        textArray.forEach((text, index) => {
          // allow user to skip items via null or undefined
          if (text == null) return;

          const element = subjects[index];

          if (isAssertionNegated) {
            expect(element.textContent()).not.toEqual(text);
          } else {
            expect(element.textContent()).toEqual(text);
          }
        });
      }
    });
  });

export const haveAttributes = <
  Html extends HTMLElement,
  Target extends Html = Html,
>(
  stateDef:
    | HtmlPropertiesOf<Target>
    | HtmlPropertiesOf<Target>[]
    | ((index: number) => HtmlPropertiesOf<Target>),
): ExtensionFn<Html, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const element = tryResolveTarget(targets, haveAttributes.name);
      const states = expandValueToArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = element[index];
        const resolvedState =
          typeof state === 'function' ? state(index) : state;
        const props = Object.entries(resolvedState) as [
          keyof Html & string,
          any,
        ][];

        props.forEach(([key, value]) => {
          const property =
            subject.nativeElement[key] ||
            subject.nativeElement.getAttribute(key);

          if (isAssertionNegated) {
            expect(property).not.toEqual(value);
          } else {
            expect(property).toEqual(value);
          }
        });
      });
    });
  });

export const haveState = <T, StateDef extends T>(
  stateDef:
    | PropertiesOf<StateDef>
    | PropertiesOf<StateDef>[]
    | ((index: number) => PropertiesOf<StateDef>),
): ExtensionFn<HTMLElement, T> =>
  createExtension(
    (
      targets: ElementListRef<HTMLElement, T>,
      { addAssertion, isAssertionNegated },
    ) => {
      addAssertion(() => {
        const element = tryResolveTarget(targets, haveState.name);
        const states = expandValueToArrayWithLength(element.length, stateDef);

        states.forEach((state, index) => {
          const subject = element[index];
          const resolvedState =
            typeof state === 'function' ? state(index) : state;
          const props = Object.entries(resolvedState) as [keyof T, any][];

          props.forEach(([key, value]) => {
            const property = subject.componentInstance[key];

            if (isAssertionNegated) {
              expect(property).not.toEqual(value);
            } else {
              expect(property).toEqual(value);
            }
          });
        });
      });
    },
  );
//#endregion

//#region types
export interface DebugOptions {
  stateOf?: TargetRef<HTMLElement, any>;
  attributesOf?: TargetRef<HTMLElement, any>;
  attributeFilter?: (attributeName: string) => boolean;
}

export interface DetectChangesOptions {
  viaChangeDetectorRef?: boolean;
}

export interface ClickOptions {
  /** The number of click-events to emit. */
  times?: number;
  /** Whether to call the nativeElement's click method. Defaults to `false`. */
  nativeClick?: boolean;
  /**
   * The event-argument emitted by the click event. Defaults to `undefined` (none).
   *
   * ---
   * **Please Note:** Only takes effect when `nativeClick` has the value `false`.
   */
  eventArgs?: any;
}

export interface FindingOptions {
  times?: number;
}

export interface LifeCycleHookCalls<T> {
  ngOnInit?: boolean;
  ngOnChanges?: boolean | PropertiesOf<T>;
  ngAfterViewInit?: boolean;
  ngAfterContentInit?: boolean;
  ngOnDestroy?: boolean;
}

//#endregion

// -------------------------------------
// Module helper functions
// -------------------------------------

export function assertEmission(
  spy: any,
  opts: EmissionOptions,
  negate?: boolean,
) {
  assertCallBase(spy, opts, negate);

  if (opts.arg) {
    if (negate) {
      expect(spy).not.toHaveBeenCalledWith(opts.arg);
    } else {
      expect(spy).toHaveBeenCalledWith(opts.arg);
    }
  }
}

export function assertCall(spy: any, opts: CallOptions, negate?: boolean) {
  assertCallBase(spy, opts, negate);

  if (opts.args) {
    if (negate) {
      expect(spy).not.toHaveBeenCalledWith(...opts.args);
    } else {
      expect(spy).toHaveBeenCalledWith(...opts.args);
    }
  }
}

function assertCallBase(spy: any, opts: CallBaseOptions, negate?: boolean) {
  if (negate) {
    if (opts.times != null) {
      expect(spy).not.toHaveBeenCalledTimes(opts.times);
    } else {
      expect(spy).not.toHaveBeenCalled();
    }
  } else {
    if (opts.times != null) {
      expect(spy).toHaveBeenCalledTimes(opts.times);
    } else if (opts.times !== null) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
  }
}

function stripAngularMetaProperties(target: any) {
  const properties = Object.entries(target).filter(
    ([key]) => key !== '__ngContext__',
  );
  const props = properties.reduce(
    (previous, [key, value]) => ({
      ...previous,
      [key]: value,
    }),
    {},
  );
  return props;
}
