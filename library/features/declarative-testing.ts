import { EventEmitter, Type } from '@angular/core';
import { tick } from '@angular/core/testing';
import { NgtxFixture } from '../entities/fixture';
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

export const createDeclarativeTestingApi: TestingApiFactoryFn = <
  Host,
  HostHtml extends HTMLElement = HTMLElement,
>(
  fx: NgtxFixture<HostHtml, Host>,
) => {
  let spyFactory = (returnValue?: any): any => {
    throw new Error(
      `No spy-factory passed to ngtx. Please call useFixture(fixture, { spyFactory: () => <spyInstance> })`,
    );
  };

  const testingApi = <Html extends HTMLElement = HTMLElement, Component = any>(
    subjectRef: PartRef<Html, Component>,
  ): DeclarativeTestingApi<HostHtml, Host, Html, Component> => {
    let state: DeclarativeTestState<any, any, any, any> = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate?.();
      state.assertion();
    };

    const expectApi = {
      expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ): Expectations<HostHtml, Host, ObjectHtml, ObjectType> {
        state = { ...state, object: objectRef };

        return {
          to(
            assertion: DeclarativeTestExtension<
              HostHtml,
              Host,
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
                assertEmission(spy, opts);
              },
            };

            executeTest();
          },
          toHaveCssClass(...classNames: string[]) {
            state = {
              ...state,
              assertion: () => {
                classNames.forEach((className) => {
                  expect(objectRef().nativeElement.classList).toContain(
                    className,
                  );
                });
              },
            };

            executeTest();
          },
          toBePresent() {
            state = {
              ...state,
              assertion: () => {
                expect(objectRef()).toBeTruthy();
              },
            };

            executeTest();
          },
          toBeMissing() {
            state = {
              ...state,
              assertion: () => {
                expect(objectRef()).toBeFalsy();
              },
            };

            executeTest();
          },
          toContainText(text: string) {
            state = {
              ...state,
              assertion: () => {
                expect(objectRef().textContent()).toContain(text);
              },
            };

            executeTest();
          },
          toHaveText(text: string) {
            state = {
              ...state,
              assertion: () => {
                expect(objectRef().textContent()).toEqual(text);
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

                  expect(property).toEqual(value);
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
                  expect(property).toEqual(value);
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
                assertEmission(emitter.emit, opts);
              },
            };

            executeTest();
          },
        };
      },
    };

    const extensionApi: ExtensionsApi<HostHtml, Host> = {
      and(
        ...extensions: DeclarativeTestExtension<
          HostHtml,
          Host,
          HTMLElement,
          unknown,
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

    const afterActionApi: AfterPredicateApi<HostHtml, Host> = Object.assign(
      {},
      extensionApi,
      expectApi,
    );

    const does = (
      action: DeclarativeTestExtension<
        HostHtml,
        Host,
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
    ): DeclarativeTestExtension<
      any,
      any,
      HTMLElement,
      T,
      HTMLElement,
      unknown
    > {
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
  (
    waitDuration?: number | 'animationFrame',
  ): DeclarativeTestExtension<
    any,
    any,
    HTMLElement,
    unknown,
    HTMLElement,
    unknown
  > =>
  ({ predicate }) => {
    return {
      predicate: () => {
        predicate?.();

        const duration = waitDuration === 'animationFrame' ? 16 : waitDuration;
        tick(duration);
      },
    };
  };

export const callsLifeCycleHooks = (
  hooks: Record<keyof LifeCycleHooks, any>,
): DeclarativeTestExtension<
  HTMLElement,
  unknown,
  HTMLElement,
  LifeCycleHooks,
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

export const emits = thenApi().emits;
export const calls = thenApi().calls;

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
          subject,
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

              fn.apply(undefined, args);
            } else {
              const nativeMethod = method as keyof Html;
              const fn = target.nativeElement[nativeMethod] as unknown as Fn;
              fn.apply(undefined, args);
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

function assertEmission(spy: any, opts: EmissionOptions) {
  expect(spy).toHaveBeenCalled();

  if (opts.args) {
    const value = opts.args;
    expect(spy).toHaveBeenCalledWith(value);
  }
  if (opts.times != null) {
    expect(spy).toHaveBeenCalledTimes(opts.times);
  }
}
