import { EventEmitter, Type } from '@angular/core';
import { tick } from '@angular/core/testing';
import { NgtxFixture } from '../entities/fixture';
import { NGTX_GLOBAL_CONFIG } from '../init-features';
import { Fn, LifeCycleHooks } from '../types';
import {
  AfterPredicateApi,
  DeclarativeTestingApi,
  Expectations,
  ExtensionsApi,
  TestingApiFactoryFn,
} from './api';
import {
  DeclarativeTestExtension,
  DeclarativeTestState,
  EmissionOptions,
  EventsOf,
  ITargetResolver,
  PartRef,
  TargetResolverFn,
} from './types';

export const createDeclarativeTestingApi: TestingApiFactoryFn = (
  fx: NgtxFixture<any, any>,
) => {
  let spyFactory = NGTX_GLOBAL_CONFIG.defaultSpyFactory;

  const testingApi = <Html extends HTMLElement = HTMLElement, Component = any>(
    subjectRef: PartRef<Html, Component>,
  ): DeclarativeTestingApi<Html, Component> => {
    let state: DeclarativeTestState<any, any, any, any> = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate?.();
      state.assertion();
    };

    const expectApi = {
      expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ): Expectations<ObjectHtml, ObjectType> {
        state = { ...state, object: objectRef };

        const expectations: Omit<
          Expectations<ObjectHtml, ObjectType>,
          'not'
        > = {
          to(
            assertion: DeclarativeTestExtension<
              HTMLElement,
              unknown,
              ObjectHtml,
              ObjectType
            >,
          ) {
            state = {
              ...state,
              ...assertion(state, fx, spyFactory),
            };

            executeTest();
          },
          toHaveCalled<T>(
            targetResolver: TargetResolverFn<
              HTMLElement,
              unknown,
              ObjectHtml,
              ObjectType,
              T
            >,
            method: keyof T,
            opts: EmissionOptions = {},
          ) {
            const spy = spyFactory(opts.whichReturns);
            const predicate = state.predicate;

            state = {
              ...state,
              predicate: () => {
                const result = targetResolver(state);
                const instance = result.getInstance();
                instance[method] = spy;

                predicate?.();
              },
              assertion: () => {
                assertEmission(spy, opts, state.negateAssertion);
              },
            };

            executeTest();
          },
          toHaveCssClass(...classNames: string[]) {
            state = {
              ...state,
              assertion: () => {
                classNames.forEach((className) => {
                  const classList = objectRef().nativeElement.classList;

                  if (state.negateAssertion) {
                    expect(classList).not.toContain(className);
                  } else {
                    expect(classList).toContain(className);
                  }
                });
              },
            };

            executeTest();
          },
          toBePresent() {
            state = {
              ...state,
              assertion: () => {
                const target = objectRef();

                if (state.negateAssertion) {
                  expect(target).not.toBeTruthy();
                } else {
                  expect(target).toBeTruthy();
                }
              },
            };

            executeTest();
          },
          toBeMissing() {
            state = {
              ...state,
              assertion: () => {
                const target = objectRef();

                if (state.negateAssertion) {
                  expect(target).not.toBeFalsy();
                } else {
                  expect(target).toBeFalsy();
                }
              },
            };

            executeTest();
          },
          toContainText(text: string) {
            state = {
              ...state,
              assertion: () => {
                const textContent = objectRef().textContent();

                if (state.negateAssertion) {
                  expect(textContent).not.toContain(text);
                } else {
                  expect(textContent).toContain(text);
                }
              },
            };

            executeTest();
          },
          toHaveText(text: string) {
            state = {
              ...state,
              assertion: () => {
                const textContent = objectRef().textContent();

                if (state.negateAssertion) {
                  expect(textContent).not.toEqual(text);
                } else {
                  expect(textContent).toEqual(text);
                }
              },
            };

            executeTest();
          },
          toHaveState(map: Partial<Record<keyof ObjectType, any>>) {
            state = {
              ...state,
              assertion: () => {
                const target = objectRef();

                Object.entries(map).forEach(([key, value]) => {
                  const property = target.componentInstance[key];

                  if (state.negateAssertion) {
                    expect(property).not.toEqual(value);
                  } else {
                    expect(property).toEqual(value);
                  }
                });
              },
            };

            executeTest();
          },
          toHaveAttributes(map: Partial<Record<keyof ObjectHtml, any>>) {
            state = {
              ...state,
              assertion: () => {
                const target = objectRef();

                Object.entries(map).forEach(([key, value]) => {
                  const property = target.nativeElement[key];

                  if (state.negateAssertion) {
                    expect(property).not.toEqual(value);
                  } else {
                    expect(property).toEqual(value);
                  }
                });
              },
            };

            executeTest();
          },
          toEmit(
            eventName: keyof ObjectType,
            opts: Omit<EmissionOptions, 'whichReturns'> = {},
          ) {
            const target = state.object();
            const emitter = target.componentInstance[
              eventName
            ] as EventEmitter<any>;

            const originalPredicate = state.predicate;

            state = {
              ...state,
              predicate: () => {
                emitter.emit = spyFactory();
                originalPredicate();
              },
              assertion: () => {
                assertEmission(emitter.emit, opts, state.negateAssertion);
              },
            };

            executeTest();
          },
        };

        return Object.assign({}, expectations, {
          not: new Proxy(
            {},
            {
              get: (_: any, prop: string) => {
                // hint: mark assertion as "to be negated":
                state.negateAssertion = !state.negateAssertion;
                return expectations[prop];
              },
            },
          ),
        }) as Expectations<ObjectHtml, ObjectType>;
      },
    };

    const extensionApi: ExtensionsApi<Html, Component> = {
      and(
        ...extensions: DeclarativeTestExtension<
          Html,
          Component,
          HTMLElement,
          unknown
        >[]
      ) {
        let newState = state;

        extensions.forEach((extension) => {
          newState = extension(newState, fx, spyFactory);
        });

        state = {
          ...state,
          ...newState,
        };

        return expectApi;
      },
    };

    const afterActionApi: AfterPredicateApi<Html, Component> = Object.assign(
      {},
      extensionApi,
      expectApi,
    );

    const does = (
      action: DeclarativeTestExtension<
        HTMLElement,
        Component,
        HTMLElement,
        unknown
      >,
    ) => {
      state = {
        ...state,
        ...action(state, fx, spyFactory),
      };

      return afterActionApi;
    };

    return {
      rendered() {
        return afterActionApi;
      },
      /** allows to add custom trigger functionality. */
      does,
      /** alias for "does" */
      has: does,
      /** alias for "does" */
      is: does,
      /** alias for "does" */
      gets: does,
      calls(method: keyof Component | keyof Html, ...args: any[]) {
        const original = state.predicate;

        state = {
          ...state,
          predicate: () => {
            original?.();
            const target = subjectRef();
            const componentMethod = method as keyof Component;

            if (
              typeof target.componentInstance[componentMethod] === 'function'
            ) {
              const fn = target.componentInstance[
                componentMethod
              ] as unknown as Fn;

              fn.apply(target.componentInstance, args);
            } else {
              const nativeMethod = method as keyof Html;
              const fn = target.nativeElement[nativeMethod] as unknown as Fn;
              fn.apply(target.nativeElement, args);
            }

            fx.detectChanges();
          },
        };

        return afterActionApi;
      },
      emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
        const original = state.predicate;

        state = {
          ...state,
          predicate: () => {
            original?.();
            subjectRef().triggerEvent(eventName as string, args);
            fx.detectChanges();
          },
        };

        return afterActionApi;
      },
      hasAttributes(map: Partial<Record<keyof Html, any>>) {
        state = {
          ...state,
          predicate: () => {
            const target = state.subject();

            Object.entries(map).forEach(([key, value]) => {
              target.nativeElement[key] = value;
            });

            fx.detectChanges();
          },
        };

        return afterActionApi;
      },
      hasState(map: Partial<Record<keyof Component, any>>) {
        state = {
          ...state,
          predicate: () => {
            const target = state.subject();

            Object.entries(map).forEach(([key, value]) => {
              target.componentInstance[key] = value;
            });

            fx.detectChanges();
          },
        };

        return afterActionApi;
      },
    };
  };

  return Object.assign(testingApi, {
    setSpyFactory: (spyFt: () => any) => {
      spyFactory = spyFt;
    },
  });
};

// ---------------------------------------
// Built-in target resolver
// ---------------------------------------

export const elementMethod = <T extends HTMLElement>(
  state: DeclarativeTestState<HTMLElement, unknown, T, unknown>,
): ITargetResolver<T> => {
  return {
    getInstance: () => state.object().nativeElement,
  };
};

export const componentMethod = <T>(
  state: DeclarativeTestState<HTMLElement, unknown, HTMLElement, T>,
): ITargetResolver<T> => {
  return {
    getInstance: () => state.object().componentInstance,
  };
};

export const injected =
  <T>(token: Type<T>) =>
  (
    state: DeclarativeTestState<HTMLElement, unknown, HTMLElement, unknown>,
  ): ITargetResolver<T> => {
    return {
      getInstance: () => state.object().injector.get(token),
    };
  };

// ---------------------------------------
// Built-in extensions
// ---------------------------------------

export const provider = <T>(token: Type<T>) => {
  return {
    hasState(
      map: Partial<Record<keyof T, any>>,
    ): DeclarativeTestExtension<HTMLElement, any, HTMLElement, any> {
      return ({ subject, predicate }, fixture) => {
        return {
          predicate: () => {
            const instance = subject().injector.get(token);

            Object.entries(map).forEach(([key, value]) => {
              instance[key] = value;
            });

            fixture.detectChanges();
            predicate?.();
          },
        };
      };
    },
  };
};

export const waitFakeAsync =
  <Subject, Object>(
    waitDuration?: number | 'animationFrame',
  ): DeclarativeTestExtension<HTMLElement, Subject, HTMLElement, Object> =>
  ({ predicate }) => {
    return {
      predicate: () => {
        predicate?.();

        const duration = waitDuration === 'animationFrame' ? 16 : waitDuration;
        tick(duration);
      },
    };
  };

export const callsLifeCycleHooks = <T>(
  hooks: Record<keyof LifeCycleHooks, any>,
): DeclarativeTestExtension<
  HTMLElement,
  LifeCycleHooks & T,
  HTMLElement,
  unknown
> => {
  return ({ subject, predicate }) => {
    return {
      predicate: () => {
        predicate?.();

        const component = subject().componentInstance;

        if (hooks.ngOnInit) {
          component.ngOnInit();
        }
        if (hooks.ngOnChanges) {
          const args = hooks.ngOnChanges === true ? {} : hooks.ngOnChanges;
          component.ngOnChanges(args);
        }
      },
    };
  };
};

export const then = <Html extends HTMLElement, Component>(
  subject: PartRef<Html, Component>,
) => {
  return thenApi(subject);
};

// ---------------------------------------
// Internal api
// ---------------------------------------

function thenApi<Html extends HTMLElement, Component>(
  subjectRef?: PartRef<Html, Component>,
) {
  return {
    calls(method: keyof Component | keyof Html, ...args: any[]) {
      return (
        {
          predicate,
        }: DeclarativeTestState<HTMLElement, unknown, HTMLElement, unknown>,
        fixture: NgtxFixture<any, any>,
      ): DeclarativeTestState<Html, Component, HTMLElement, unknown> => {
        return {
          predicate: () => {
            predicate?.();
            const target = subjectRef();
            const componentMethod = method as keyof Component;

            if (
              typeof target.componentInstance[componentMethod] === 'function'
            ) {
              const fn = target.componentInstance[
                componentMethod
              ] as unknown as Fn;

              fn.apply(target.componentInstance, args);
            } else {
              const nativeMethod = method as keyof Html;
              const fn = target.nativeElement[nativeMethod] as unknown as Fn;
              fn.apply(target.nativeElement, args);
            }

            fixture.detectChanges();
          },
        };
      };
    },
    emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
      return (
        state: DeclarativeTestState<HTMLElement, unknown, HTMLElement, unknown>,
        fixture: NgtxFixture<any, any>,
      ): DeclarativeTestState<Html, Component, HTMLElement, unknown> => {
        const original = state.predicate;

        return {
          predicate: () => {
            original?.();
            subjectRef().triggerEvent(eventName as string, args);
            fixture.detectChanges();
          },
        };
      };
    },
  };
}

// ---------------------------------------
// Exported types that must be in this module
// ---------------------------------------

// export type DeclarativeTestingApi<
//   Component,
//   Html extends HTMLElement = HTMLElement,
// > = ReturnType<Wrapper<Html, Component>['wrapped']> & {
// /**
//  * Sets the spyFactory for ngtx to use with declarative testing.
//  * @param spyFactory A factory function that returns a testing-framework-specific spy.
//  */
// setSpyFactory(spyFactory: SpyFactoryFn): void;
// };

// ---------------------------------------
// Module internal
// ---------------------------------------

function assertEmission(spy: any, opts: EmissionOptions, negate: boolean) {
  if (negate) {
    expect(spy).not.toHaveBeenCalled();

    if (opts.args) {
      const value = opts.args;
      expect(spy).not.toHaveBeenCalledWith(value);
    }
    if (opts.times != null) {
      expect(spy).not.toHaveBeenCalledTimes(opts.times);
    }
  } else {
    expect(spy).toHaveBeenCalled();

    if (opts.args) {
      const value = opts.args;
      expect(spy).toHaveBeenCalledWith(value);
    }
    if (opts.times != null) {
      expect(spy).toHaveBeenCalledTimes(opts.times);
    }
  }
}
