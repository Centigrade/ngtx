import { EventEmitter } from '@angular/core';
import { NgtxElement } from '../entities/element';
import { NgtxFixture } from '../entities/fixture';
import { LifeCycleHooks } from '../types';

export function createDeclarativeTestingApi<
  Host,
  HostHtml extends HTMLElement = HTMLElement,
>(fx: NgtxFixture<HostHtml, Host>) {
  let spyFactory = () => ({} as any);

  const testingApi = <Html extends HTMLElement = HTMLElement, Component = any>(
    subjectRef: PartRef<Html, Component>,
  ) => {
    let state: DeclarativeTestState = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate();
      state.assertion();
    };

    const expectApi = {
      expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ) {
        state = { ...state, object: objectRef };
        return {
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
                  const targetValue = resolveFnValue(value);
                  const property = target.componentInstance[key];

                  expect(property).toEqual(targetValue);
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
          toEmit(eventName: keyof ObjectType, opts: EmissionOptions = {}) {
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
                expect(emitter.emit).toHaveBeenCalled();

                if (opts.args) {
                  const value = resolveFnValue(opts.args);
                  expect(emitter.emit).toHaveBeenCalledWith(value);
                }
                if (opts.times != null) {
                  expect(emitter.emit).toHaveBeenCalledTimes(opts.times);
                }
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

    return {
      emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
        state = {
          ...state,
          predicate: () => {
            subjectRef().triggerEvent(eventName as string, args);
            fx.detectChanges();
          },
        };

        return Object.assign({}, extensionApi, expectApi);
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

        return Object.assign({}, extensionApi, expectApi);
      },
    };
  };

  return Object.assign(testingApi, {
    setSpyFactory: (spyFt: () => any) => {
      spyFactory = spyFt;
    },
  });
}

function resolveFnValue(value: unknown) {
  return typeof value === 'function' ? value() : value;
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

export const part = <T>(subject: PartRef<any, T>) => {
  return {
    emits(eventName: keyof T, args?: any) {
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

// ---------------------------------------
// Module types
// ---------------------------------------

export interface EmissionOptions {
  args?: any;
  times?: number;
}

export type DeclarativeTestingApi<
  Component,
  Html extends HTMLElement = HTMLElement,
> = ReturnType<Wrapper<Html, Component>['wrapped']> & {
  setSpyFactory(spyFt: () => any): void;
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
