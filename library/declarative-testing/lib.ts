import { NgtxElement } from '../entities';
import { ExtensionFn } from './api';
import { createExtension } from './declarative-testing';
import {
  CallBaseOptions,
  CallOptions,
  EmissionOptions,
  Events,
  ITargetResolver,
  Maybe,
  PropertyState,
  PublicApi,
  Token,
} from './types';
import {
  asArray,
  checkAssertionsCountMatchesFoundElementCount,
} from './utility';

//#region target resolvers
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
      targets().forEach((subject) => {
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
export const call = <Html extends HTMLElement, Component, Out>(
  resolver: ITargetResolver<Html, Component, Out>,
  methodName: keyof PublicApi<Out>,
  args: any[] = [],
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets().forEach((target) => {
        const token = resolver(target);
        const method = (token as any)[methodName] as Function;
        method.apply(token, ...args);
      });

      fixture.detectChanges();
    });
  });

export const emit = <Html extends HTMLElement, Type>(
  eventName: Events<Html, Type>,
  arg?: any,
): ExtensionFn<Html, Type> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets().forEach((subject) => {
        subject.triggerEvent(eventName as string, arg);
      });

      fixture.detectChanges();
    });
  });

export const attributes = <Html extends HTMLElement>(
  stateDef: PropertyState<Html> | PropertyState<Html>[],
): ExtensionFn<Html, any> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = targets();
      const states = asArray(stateDef);

      checkAssertionsCountMatchesFoundElementCount(
        'attributes',
        states,
        element,
      );

      states.forEach((state, index) => {
        const subject = targets().atIndex(index);
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          subject.nativeElement[key] = value;
        });

        fixture.detectChanges();
      });
    });
  });

export const state = <T>(
  stateDef: PropertyState<T> | PropertyState<T>[],
): ExtensionFn<HTMLElement, T> =>
  createExtension((targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = targets();
      const states = asArray(stateDef);

      checkAssertionsCountMatchesFoundElementCount('state', states, element);

      states.forEach((state, index) => {
        const subject = targets().atIndex(index);
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
export const beMissing = <Html extends HTMLElement, Component>(): ExtensionFn<
  Html,
  Component
> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
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
      const subjects = targets();
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
  resolver: ITargetResolver<Html, Component, Out>,
  methodName: keyof PublicApi<Out>,
  opts: CallOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { addAssertion, spyOn, isAssertionNegated }) => {
    const resolveTarget = () => {
      const firstResult = targets()?.first?.();
      return firstResult ? resolver(firstResult) : undefined!;
    };

    const spy = spyOn(resolveTarget, methodName, opts.whichReturns);
    addAssertion(() => assertEmission(spy, opts, isAssertionNegated));
  });

export const haveEmitted = <Html extends HTMLElement, Component>(
  eventName: Events<Html, Component>,
  opts: EmissionOptions = {},
): ExtensionFn<Html, Component> =>
  createExtension((targets, { spyOn, addAssertion, isAssertionNegated }) => {
    const resolve = () => {
      const subject = targets().first();
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
      const subject = targets();

      asArray(texts).forEach((text, index) => {
        const element = subject.atIndex(index);

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
      const subject = targets();

      asArray(texts).forEach((text, index) => {
        const element = subject.atIndex(index);

        if (isAssertionNegated) {
          expect(element.textContent()).not.toEqual(text);
        } else {
          expect(element.textContent()).toEqual(text);
        }
      });
    });
  });

export const haveAttributes = <Html extends HTMLElement>(
  stateDef: PropertyState<Html> | PropertyState<Html>[],
): ExtensionFn<Html, any> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const states = asArray(stateDef);
      const element = targets();

      checkAssertionsCountMatchesFoundElementCount(
        'haveAttributes',
        states,
        element,
      );

      states.forEach((state, index) => {
        const subject = element.atIndex(index);
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
  stateDef: PropertyState<T> | PropertyState<T>[],
): ExtensionFn<HTMLElement, T> =>
  createExtension((targets, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const states = asArray(stateDef);
      const element = targets();

      checkAssertionsCountMatchesFoundElementCount(
        'haveState',
        states,
        element,
      );

      states.forEach((state, index) => {
        const subject = element.atIndex(index);
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
