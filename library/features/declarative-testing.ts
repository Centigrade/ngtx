import { EventEmitter } from '@angular/core';
import { NgtxElement } from '../entities/element';
import { NgtxFixture } from '../entities/fixture';
import { LifeCycleHooks } from '../types';

export function createDeclarativeTestingApi<
  Host,
  HostHtml extends Element = Element,
>(fx: NgtxFixture<HostHtml, Host>) {
  let spyFactory = () => ({} as any);
  let states: DeclarativeTestState[] = [];

  const testingApi = <Html extends Element, Component>(
    subjectRef: PartRef<Html, Component>,
  ) => {
    states.push({ subject: subjectRef });

    const currentState = () => {
      return states[states.length - 1];
    };
    const updateCurrentState = (newState: DeclarativeTestState) => {
      const state = currentState();
      const index = states.indexOf(state);
      states[index] = newState;
    };

    const executeTest = () => {
      states.forEach((state) => {
        state.predicate();
        state.assertion?.();
      });
    };

    const expectApi = {
      expect<ObjectHtml extends Element, ObjectType>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ) {
        const state = currentState();
        const currentPredicate = state.predicate;
        const currentAssertion = state.assertion;

        updateCurrentState({ ...state, object: objectRef });

        return {
          toHaveState(map: Partial<Record<keyof ObjectType, any>>) {
            updateCurrentState({
              ...state,
              assertion: () => {
                currentAssertion?.();

                const target = objectRef();

                Object.entries(map).forEach(([key, value]) => {
                  const targetValue = resolveFnValue(value);
                  const property = target.componentInstance[key];

                  expect(property).toEqual(targetValue);
                });
              },
            });

            executeTest();
          },
          toHaveAttributes(map: Partial<Record<keyof ObjectHtml, any>>) {
            const state = currentState();
            updateCurrentState({
              ...state,
              assertion: () => {
                currentAssertion?.();

                const target = objectRef();

                Object.entries(map).forEach(([key, value]) => {
                  const property = target.nativeElement[key];
                  expect(property).toEqual(value);
                });
              },
            });

            executeTest();
          },
          toEmit(eventName: keyof ObjectType, opts: EmissionOptions = {}) {
            const state = currentState();
            const target = state.object();
            const emitter = target.componentInstance[
              eventName
            ] as EventEmitter<any>;

            const originalPredicate = state.predicate;

            updateCurrentState({
              ...state,
              predicate: () => {
                currentPredicate?.();

                emitter.emit = spyFactory();
                originalPredicate();
              },
              assertion: () => {
                currentAssertion?.();

                expect(emitter.emit).toHaveBeenCalled();

                if (opts.args) {
                  const value = resolveFnValue(opts.args);
                  expect(emitter.emit).toHaveBeenCalledWith(value);
                }
                if (opts.times != null) {
                  expect(emitter.emit).toHaveBeenCalledTimes(opts.times);
                }
              },
            });

            executeTest();
          },
        };
      },
    };

    const extensionApi = {
      and(...extensions: DeclarativeTestExtension<HostHtml, Host>[]) {
        let newState = currentState();

        extensions.forEach((extension) => {
          newState = extension(newState, fx);
        });

        updateCurrentState({
          ...currentState(),
          ...newState,
        });

        return expectApi;
      },
    };

    return {
      emits(eventName: keyof Component | EventsOf<keyof Html>, args?: any) {
        const state = currentState();
        updateCurrentState({
          ...state,
          predicate: () => {
            subjectRef().triggerEvent(eventName as string, args);
            fx.detectChanges();
          },
        });

        return Object.assign({}, extensionApi, expectApi);
      },
      hasState(map: Partial<Record<keyof Component, any>>) {
        const state = currentState();
        updateCurrentState({
          ...state,
          predicate: () => {
            const target = state.subject();

            Object.entries(map).forEach(([key, value]) => {
              target.componentInstance[key] = value;
            });

            fx.detectChanges();
          },
        });

        return Object.assign(
          {},
          { alongWith: testingApi },
          extensionApi,
          expectApi,
        );
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
): DeclarativeTestExtension<Element, LifeCycleHooks> => {
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

// ---------------------------------------
// Module types
// ---------------------------------------

export interface EmissionOptions {
  args?: any;
  times?: number;
}

export type DeclarativeTestingApi<
  Component,
  Html extends Element = HTMLElement,
> = ReturnType<Wrapper<Html, Component>['wrapped']> & {
  setSpyFactory(spyFt: () => any): void;
};

export type PartRef<Html extends Element, Type> = () => NgtxElement<Html, Type>;

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;

export interface DeclarativeTestState {
  subject?: PartRef<any, any>;
  predicate?: () => void;
  object?: PartRef<any, any>;
  assertion?: () => void;
}

export type DeclarativeTestExtension<Html extends Element, Component> = (
  input: DeclarativeTestState,
  fixture: NgtxFixture<Html, Component>,
) => DeclarativeTestState;

// workaround, see: https://stackoverflow.com/a/64919133/3063191
class Wrapper<Html extends Element, T> {
  wrapped(e: NgtxFixture<Html, T>) {
    return createDeclarativeTestingApi<T>(e);
  }
}
