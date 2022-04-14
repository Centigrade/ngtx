import { EventEmitter, Type } from '@angular/core';
import { NgtxElement } from '../entities/element';
import { NgtxFixture } from '../entities/fixture';
import { LifeCycleHooks } from '../types';

export function createDeclarativeTestingApi<
  Host,
  HostHtml extends HTMLElement = HTMLElement,
>(fx: NgtxFixture<HostHtml, Host>) {
  let spyFactory = (returnValue?: any): any => {
    throw new Error(
      `No spy-factory passed to ngtx. Please call useFixture(fixture, { spyFactory: () => <spyInstance> })`,
    );
  };

  const testingApi = <Html extends HTMLElement = HTMLElement, Component = any>(
    subjectRef: PartRef<Html, Component>,
  ) => {
    let state: DeclarativeTestState = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate?.();
      state.assertion();
    };

    const expectApi = {
      expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ) {
        state = { ...state, object: objectRef };
        return {
          to(assertion: DeclarativeTestExtension<HostHtml, Host>) {
            state = {
              ...state,
              ...assertion(state, fx),
            };

            executeTest();
          },
          toHaveCalled<T>(
            injectionToken: Type<T>,
            methodName: keyof T,
            opts: EmissionOptions = {},
          ) {
            const originalPredicate = state.predicate;
            const spy = spyFactory(opts.whichReturns);

            state = {
              ...state,
              predicate: () => {
                const instance = objectRef().injector.get(injectionToken);
                instance[methodName] = spy;

                originalPredicate?.();
              },
              assertion: () => {
                assertEmission(spy, opts);
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

    const extensionApi = {
      and(...extensions: DeclarativeTestExtension<HostHtml, Host>[]) {
        let newState = state;

        extensions.forEach((extension) => {
          newState = extension(newState, fx);
        });

        state = {
          ...state,
          ...newState,
        };

        return expectApi;
      },
    };

    const afterActionApi = Object.assign({}, extensionApi, expectApi);

    return {
      rendered() {
        return afterActionApi;
      },
      emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
        state = {
          ...state,
          predicate: () => {
            subjectRef().triggerEvent(eventName as string, args);
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
}

// ---------------------------------------
// Built-in extensions
// ---------------------------------------

export const callsLifeCycleHooks = (
  hooks: Record<keyof LifeCycleHooks, any>,
): DeclarativeTestExtension<HTMLElement, LifeCycleHooks> => {
  return (state, fixture) => {
    const original = state.predicate;
    return {
      predicate: () => {
        original?.();

        const component = fixture.rootElement.componentInstance;

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
  return {
    emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
      return (state: DeclarativeTestState, fixture: NgtxFixture<any, any>) => {
        const original = state.predicate;

        return {
          predicate: () => {
            original?.();
            subject().triggerEvent(eventName as string, args);
            fixture.detectChanges();
          },
        } as DeclarativeTestState;
      };
    },
  };
};

export const tap: (
  action?: (state: DeclarativeTestState) => any,
  before?: boolean,
) => DeclarativeTestExtension<any, any> =
  (action: (state: DeclarativeTestState) => any, before = false) =>
  (state) => {
    const originalPredicate = state.predicate;
    const after = !before;

    return {
      predicate: () => {
        if (before) {
          action?.(state);
        }

        originalPredicate?.();

        if (after) {
          action?.(state);
        }
      },
    };
  };

// ---------------------------------------
// Module types
// ---------------------------------------

export interface EmissionOptions {
  args?: any;
  times?: number;
  whichReturns?: any;
}

export type DeclarativeTestingApi<
  Component,
  Html extends HTMLElement = HTMLElement,
> = ReturnType<Wrapper<Html, Component>['wrapped']> & {
  setSpyFactory(spyFactory: (returnValue?: any) => any): void;
};

export type PartRef<Html extends HTMLElement, Type> = () => NgtxElement<
  Html,
  Type
>;

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;

export interface DeclarativeTestState {
  subject?: PartRef<any, any>;
  predicate?: () => void;
  object?: PartRef<any, any>;
  assertion?: () => void;
}

export type DeclarativeTestExtension<Html extends HTMLElement, Component> = (
  input: DeclarativeTestState,
  fixture: NgtxFixture<Html, Component>,
) => DeclarativeTestState;

// workaround, see: https://stackoverflow.com/a/64919133/3063191
class Wrapper<Html extends HTMLElement, T> {
  wrapped(e: NgtxFixture<Html, T>) {
    return createDeclarativeTestingApi<T>(e);
  }
}

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
