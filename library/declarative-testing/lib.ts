import { NgtxElement } from '../entities';
import { ExtensionFn } from './api';
import {
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
): ExtensionFn<Html, Type> => {
  return (targets, testEnv, fixture) => {
    let newState = { ...testEnv };

    fns.forEach((fn) => {
      fn(targets, testEnv, fixture);
    });
  };
};

export const clicked =
  <Html extends HTMLElement, Type>(
    opts: ClickOptions = {},
  ): ExtensionFn<Html, Type> =>
  (targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets().forEach((subject) => {
        const times = opts.times ?? 1;

        for (let i = 0; i < times; i++) {
          subject.triggerEvent('click');
        }
      });

      fixture.detectChanges();
    });
  };
//#endregion

//#region predicate extensions
export const call =
  <Html extends HTMLElement, Component, Out>(
    resolver: ITargetResolver<Html, Component, Out>,
    methodName: keyof PublicApi<Out>,
    args: any[] = [],
  ): ExtensionFn<Html, Component> =>
  (targets, { addPredicate }, fixture) => {
    addPredicate(() => {
      targets().forEach((target) => {
        const token = resolver(target);
        const method = (token as any)[methodName] as Function;
        method.apply(token, ...args);

        console.log('CALL', method.toString());
      });

      fixture.detectChanges();
    });
  };

export const emit =
  <Html extends HTMLElement, Type>(
    eventName: Events<Html, Type>,
    args?: any,
  ): ExtensionFn<Html, Type> =>
  (target, { addPredicate }, fixture) => {
    addPredicate(() => {
      target().forEach((subject) => {
        subject.triggerEvent(eventName as string, args);
      });

      fixture.detectChanges();
    });
  };

export const attributes =
  <Html extends HTMLElement>(
    stateDef: PropertyState<Html> | PropertyState<Html>[],
  ): ExtensionFn<Html, any> =>
  (target, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = target();
      const states = asArray(stateDef);

      checkAssertionsCountMatchesFoundElementCount(
        'attributes',
        states,
        element,
      );

      states.forEach((state, index) => {
        const subject = target().atIndex(index);
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          subject.nativeElement[key] = value;
        });

        fixture.detectChanges();
      });
    });
  };

export const state =
  <T>(
    stateDef: PropertyState<T> | PropertyState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { addPredicate }, fixture) => {
    addPredicate(() => {
      const element = target();
      const states = asArray(stateDef);

      checkAssertionsCountMatchesFoundElementCount('state', states, element);

      states.forEach((state, index) => {
        const subject = target().atIndex(index);
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          subject.componentInstance[key] = value;
        });

        fixture.detectChanges();
      });
    });
  };
//#endregion

//#region assertion extensions
export const haveCalled =
  <Html extends HTMLElement, Component, Out>(
    resolver: ITargetResolver<Html, Component, Out>,
    methodName: keyof PublicApi<Out>,
    opts: EmissionOptions = {},
  ): ExtensionFn<Html, Component> =>
  (targets, { addAssertion, spyOn, isAssertionNegated }, fx) => {
    const resolveTarget = () => {
      const firstResult = targets()?.first?.();
      return firstResult ? resolver(firstResult) : undefined!;
    };

    const spy = spyOn(resolveTarget, methodName, opts.whichReturns);
    addAssertion(() => assertEmission(spy, opts, isAssertionNegated));
  };

export const containText =
  (texts: Maybe<string> | Maybe<string>[]): ExtensionFn<HTMLElement, any> =>
  (target, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subject = target();

      asArray(texts).forEach((text, index) => {
        const element = subject.atIndex(index);

        if (isAssertionNegated) {
          expect(element.textContent()).not.toContain(text);
        } else {
          expect(element.textContent()).toContain(text);
        }
      });
    });
  };

export const haveText =
  (texts: Maybe<string> | Maybe<string>[]): ExtensionFn<HTMLElement, any> =>
  (target, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const subject = target();

      asArray(texts).forEach((text, index) => {
        const element = subject.atIndex(index);

        if (isAssertionNegated) {
          expect(element.textContent()).not.toEqual(text);
        } else {
          expect(element.textContent()).toEqual(text);
        }
      });
    });
  };

export const haveAttributes =
  <Html extends HTMLElement>(
    stateDef: PropertyState<Html> | PropertyState<Html>[],
  ): ExtensionFn<Html, any> =>
  (target, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const states = asArray(stateDef);
      const element = target();

      checkAssertionsCountMatchesFoundElementCount(
        'haveAttributes',
        states,
        element,
      );

      states.forEach((state, index) => {
        const subject = element.atIndex(index);
        const props = Object.entries(state) as [string, any][];

        props.forEach(([key, value]) => {
          const property = subject.attr(key);

          if (isAssertionNegated) {
            expect(property).not.toEqual(value);
          } else {
            expect(property).toEqual(value);
          }
        });
      });
    });
  };

export const haveState =
  <T>(
    stateDef: PropertyState<T> | PropertyState<T>[],
  ): ExtensionFn<HTMLElement, T> =>
  (target, { addAssertion, isAssertionNegated }) => {
    addAssertion(() => {
      const states = asArray(stateDef);
      const element = target();

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
  };
//#endregion

//#region types
export interface ClickOptions {
  times?: number;
}
//#endregion

// -------------------------------------
// Module internals
// -------------------------------------

function assertEmission(spy: any, opts: EmissionOptions, negate?: boolean) {
  if (negate) {
    expect(spy).not.toHaveBeenCalled();

    if (opts.args) {
      const value = opts.args;
      expect(spy).not.toHaveBeenCalledWith(...value);
    }
    if (opts.times != null) {
      expect(spy).not.toHaveBeenCalledTimes(opts.times);
    }
  } else {
    expect(spy).toHaveBeenCalled();

    if (opts.args) {
      const value = opts.args;
      expect(spy).toHaveBeenCalledWith(...value);
    }
    if (opts.times != null) {
      expect(spy).toHaveBeenCalledTimes(opts.times);
    } else if (opts.times !== null) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
  }
}
