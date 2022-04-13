import { EventEmitter } from '@angular/core';
import { NgtxElement } from './element';
import { NgtxFixture } from './fixture';

export let $event: any = undefined;

export function createEffectTestingApi<
  Host,
  HostHtml extends Element = Element,
>(fx: NgtxFixture<HostHtml, Host>) {
  let spyFactory = () => ({} as any);

  const effectTestingApi = <Html extends Element, Component>(
    subjectRef: PartRef<Html, Component>,
  ) => {
    let state: State = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate();
      state.assertion();
      // clean up possible event args
      $event = undefined;
    };

    const expectApi = {
      expect<ObjectHtml extends Element, ObjectType>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ) {
        state = { ...state, object: objectRef };
        return {
          toHaveState(map: Partial<Record<keyof ObjectType, any>>) {
            state = {
              ...state,
              assertion: () => {
                const target = resolve(objectRef);
                Object.entries(map).forEach(([key, value]) => {
                  const targetValue = resolveFnValue(value);
                  const property = target.componentInstance[key];

                  expect(property).toEqual(targetValue);
                });
              },
            };

            executeTest();
          },
          toEmit(eventName: keyof ObjectType, opts: EmissionOptions = {}) {
            const target = resolve(state.object) as NgtxElement;
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

    return {
      emits(eventName: keyof Component & EventsOf<keyof Html>, args?: any) {
        state = {
          ...state,
          predicate: () => {
            // caution: module scope pollution. needs to be cleared after test execution
            $event = args;
            const target = resolve(subjectRef);
            target.triggerEvent(eventName as string, args);
            fx.detectChanges();
          },
        };

        return expectApi;
      },
    };
  };

  return Object.assign(effectTestingApi, {
    setSpyFactory: (spyFt: () => any) => {
      spyFactory = spyFt;
    },
  });
}

function resolveFnValue(value: unknown) {
  return typeof value === 'function' ? value() : value;
}

function resolve<Html extends Element, Type>(
  ref: PartRef<Html, Type>,
): NgtxElement<Html, Type> {
  if (typeof ref === 'function') {
    return ref();
  }

  return ref;
}

// ---------------------------------------
// Module types
// ---------------------------------------

export interface EmissionOptions {
  args?: any;
  times?: number;
}

export type EffectTestingApi<
  T,
  Html extends Element = HTMLElement,
> = ReturnType<Wrapper<Html, T>['wrapped']> & {
  setSpyFactory(spyFt: () => any): void;
};

export type PartRef<Html extends Element, Type> =
  | (() => NgtxElement<Html, Type>)
  | NgtxElement<Html, Type>;

// workaround, see: https://stackoverflow.com/a/64919133/3063191
class Wrapper<Html extends Element, T> {
  wrapped(e: NgtxFixture<Html, T>) {
    return createEffectTestingApi<T>(e);
  }
}

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;

interface State {
  subject?: PartRef<any, any>;
  predicate?: () => void;
  object?: PartRef<any, any>;
  assertion?: () => void;
}
