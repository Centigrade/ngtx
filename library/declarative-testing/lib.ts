import { tick } from '@angular/core/testing';
import { NgtxElement } from '../core';
import { Maybe } from '../types';
import { createExtension } from './declarative-testing';
import {
  CallBaseOptions,
  CallOptions,
  CssClass,
  EmissionOptions,
  EventResolver,
  Events,
  ExtensionFn,
  IHaveLifeCycleHook,
  PropertiesOf,
  TargetResolver,
  Token,
} from './types';
import {
  asArray,
  checkListsHaveSameSize,
  ensureArrayWithLength,
} from './utility';

//#region target resolvers
export const nativeEvent =
  <Html extends HTMLElement>(eventName: Events<Html, unknown>) =>
  (subject: NgtxElement<Html, any>, eventType?: Event) => {
    const event = eventType ?? new Event(eventName);
    subject.nativeElement.dispatchEvent(event);
  };

export const componentMethod = <T>(element: NgtxElement<HTMLElement, T>) => {
  return element.componentInstance;
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
export const debug = <Html extends HTMLElement, Type>(): ExtensionFn<
  Html,
  Type
> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      fixture.rootElement.debug();
    });
  });

export const and = <Html extends HTMLElement, Type>(
  ...fns: ExtensionFn<Html, Type>[]
): ExtensionFn<Html, Type> =>
  createExtension((targets, testEnv, fixture) => {
    fns.forEach((fn) => {
      fn(targets, testEnv, fixture);
    });
  });

export const clicked = <Html extends HTMLElement, Type>(
  opts: ClickOptions = {},
): ExtensionFn<Html, Type> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets()
        .subjects()
        .forEach((subject) => {
          const times = opts.times ?? 1;

          for (let i = 0; i < times; i++) {
            if (opts.nativeClick) {
              subject.nativeElement.click();
            } else {
              subject.triggerEvent('click');
            }
          }
        });

      fixture.detectChanges();
    });
  });
//#endregion

//#region predicate extensions
export const callLifeCycleHook = <Html extends HTMLElement, Component>(
  hooks: LifeCycleHookCalls<Component>,
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addPredicate }) => {
    addPredicate(() => {
      targets()
        .subjects()
        .forEach((subject) => {
          const host =
            subject.componentInstance as unknown as IHaveLifeCycleHook;

          if (hooks.ngOnChanges) {
            const args = hooks.ngOnChanges === true ? {} : hooks.ngOnChanges;
            host.ngOnChanges!(args);
          }
          if (hooks.ngOnInit) {
            host.ngOnInit!();
          }
          if (hooks.ngAfterViewInit) {
            host.ngAfterViewInit!();
          }
          if (hooks.ngOnDestroy) {
            host.ngOnDestroy!();
          }
        });
    });
  });

export const waitFakeAsync = (durationOrMs: 'animationFrame' | number = 0) =>
  createExtension((targets, { addPredicate }, fx) => {
    addPredicate(() => {
      const duration = durationOrMs === 'animationFrame' ? 16 : durationOrMs;
      tick(duration);
      fx.detectChanges();
    });
  });

export const call = <Html extends HTMLElement, Component, Out>(
  resolver: TargetResolver<Html, Component, Out>,
  methodName: keyof Out,
  args: any[] = [],
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets()
        .subjects()
        .forEach((target) => {
          const token = resolver(target);
          const method = (token as any)[methodName] as Function;
          method.apply(token, ...args);
        });

      fixture.detectChanges();
    });
  });

export const emit = <Html extends HTMLElement, Type>(
  eventNameOrResolver: Events<Html, Type> | EventResolver,
  arg?: any,
): ExtensionFn<Html, Type> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets()
        .subjects()
        .forEach((subject) => {
          if (typeof eventNameOrResolver === 'function') {
            eventNameOrResolver(subject);
          } else {
            subject.triggerEvent(eventNameOrResolver as string, arg);
          }
        });

      fixture.detectChanges();
    });
  });

export const attributes = <Html extends HTMLElement>(
  stateDef: PropertiesOf<Html> | PropertiesOf<Html>[],
): ExtensionFn<Html, any> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = targets().subjects();
      const states = ensureArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = targets().subjects()[index];
        const props = Object.entries(state) as [string, any][];

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
      const element = targets().subjects();
      const states = ensureArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = element[index];
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          subject.componentInstance[key] = value;
        });

        fixture.detectChanges();
      });
    });
  });
//#endregion

//#region assertion extensions
export const haveCssClass = <Html extends HTMLElement, Component>(
  cssClasses: CssClass | (CssClass | string[])[],
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subjects = targets().subjects();
      // hint: if single class is given as input, it will be expanded to be checked on all subjects:
      const classArray = ensureArrayWithLength(subjects.length, cssClasses);

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
      const subjects = targets()?.subjects?.();
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
      const subjects = targets()?.subjects?.();
      const count = subjects?.length ?? 0;

      if (isAssertionNegated) {
        if (opts?.count) {
          expect(count).not.toBe(opts.count);
        } else {
          expect(count).not.toBeGreaterThan(0);
        }
      } else {
        if (opts?.count) {
          expect(count).toBe(opts.count);
        } else {
          expect(count).toBeGreaterThan(0);
        }
      }
    });
  });

export const haveCalled = <Html extends HTMLElement, Component, Out>(
  resolver: TargetResolver<Html, Component, Out>,
  methodName: keyof Out,
  opts: CallOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, spyOn, isAssertionNegated }) => {
    const resolveTarget = () => {
      const subject = targets()?.subjects()[0];
      return subject ? resolver(subject) : undefined!;
    };

    const spy = spyOn(resolveTarget, methodName, opts.whichReturns);
    addAssertion(() => assertCall(spy, opts, isAssertionNegated));
  });

export const haveEmitted = <Html extends HTMLElement, Component>(
  eventName: Events<Html, Component>,
  opts: EmissionOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { spyOn, addAssertion, isAssertionNegated }) => {
    const resolve = () => {
      const subject = targets().subjects()[0];
      const component: any = subject.componentInstance;
      const nativeElement: any = subject.nativeElement;

      if (typeof component[eventName]?.emit === 'function') {
        return component[eventName];
      } else {
        return nativeElement;
      }
    };

    // TODO: refactor magic string!
    const spy = spyOn(resolve, 'ngtx:spyEvent');

    addAssertion(() => assertEmission(spy, opts, isAssertionNegated));
  });

export const containText = (
  texts: Maybe<string> | Maybe<string>[],
): ExtensionFn<HTMLElement, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const target = targets();
      const textArray = asArray(texts);

      checkListsHaveSameSize('containText', textArray, target.subjects());

      textArray.forEach((text, index) => {
        // allow user to skip items via null or undefined
        if (text == null) return;

        const element = target.subjects()[index];

        if (isAssertionNegated) {
          expect(element.textContent()).not.toContain(text);
        } else {
          expect(element.textContent()).toContain(text);
        }
      });
    });
  });

export const haveText = (
  texts: Maybe<string> | Maybe<string>[],
): ExtensionFn<HTMLElement, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const target = targets();
      const textArray = asArray(texts);

      checkListsHaveSameSize('haveText', textArray, target.subjects());

      textArray.forEach((text, index) => {
        // allow user to skip items via null or undefined
        if (text == null) return;

        const element = target.subjects()[index];

        if (isAssertionNegated) {
          expect(element.textContent()).not.toEqual(text);
        } else {
          expect(element.textContent()).toEqual(text);
        }
      });
    });
  });

export const haveAttributes = <Html extends HTMLElement>(
  stateDef: PropertiesOf<Html> | PropertiesOf<Html>[],
): ExtensionFn<Html, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const element = targets().subjects();
      const states = ensureArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = element[index];
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          const property = subject.nativeElement[key];

          if (isAssertionNegated) {
            expect(property).not.toEqual(value);
          } else {
            expect(property).toEqual(value);
          }
        });
      });
    });
  });

export const haveState = <T>(
  stateDef: PropertiesOf<T> | PropertiesOf<T>[],
): ExtensionFn<HTMLElement, T> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const element = targets().subjects();
      const states = ensureArrayWithLength(element.length, stateDef);

      states.forEach((state, index) => {
        const subject = element[index];
        const props = Object.entries(state) as [string, any][];

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
  });
//#endregion

//#region types
export interface ClickOptions {
  times?: number;
  nativeClick?: boolean;
}

export interface FindingOptions {
  count?: number;
}

export interface LifeCycleHookCalls<T> {
  ngOnInit?: boolean;
  ngOnChanges?: boolean | PropertiesOf<T>;
  ngAfterViewInit?: boolean;
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

export function assertCallBase(
  spy: any,
  opts: CallBaseOptions,
  negate?: boolean,
) {
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
