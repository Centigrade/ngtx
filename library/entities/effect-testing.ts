import { NgtxElement } from './element';
import { NgtxFixture } from './fixture';

export let $event: () => any = () => undefined;

export function When<Host, Html extends Element = Element>(
  fx: NgtxFixture<Html, Host>,
  spyFt: () => any,
) {
  return <Html extends Element, Component>(
    subjectRef: PartRef<Html, Component>,
  ) => {
    let state: State = {};
    state = { subject: subjectRef };

    const executeTest = () => {
      state.predicate();
      state.assertion();
      // clean up possible event args
      $event = () => undefined;
    };

    const expectApi = {
      expect<ObjectHtml extends Element, ObjectType>(
        objectRef: PartRef<ObjectHtml, ObjectType>,
      ) {
        state = { ...state, object: objectRef };
        return {
          toHaveState(map: Record<keyof ObjectType, any>) {
            state = {
              ...state,
              assertion: () => {
                const target = resolve(objectRef as any, fx);
                Object.entries(map).forEach(([key, value]) => {
                  const targetValue =
                    typeof value === 'function' ? value() : value;
                  const property = target.componentInstance[key];

                  expect(property).toEqual(targetValue);
                });
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
            $event = () => args;
            const target = resolve(subjectRef as any, fx);
            target.triggerEvent(eventName as string, args);
            fx.detectChanges();
          },
        };

        return expectApi;
      },

      // expectHostProperty(propertyName: keyof Host) {
      //   const value = fx.componentInstance[propertyName];

      //   return {
      //     toChangeToEventValue() {
      //       expect(value).toBe(args);
      //     },
      //     toChangeToValue(expectedValue: any) {
      //       expect(value).toBe(expectedValue);
      //     },
      //   };
      // },
      // expectHostToEmit(eventName: keyof Host) {
      //   const eventSpy = fx.componentInstance[
      //     eventName
      //   ] as unknown as EventEmitter<any>;
      //   eventSpy.emit = spyFt();
      //   // need to trigger again for spy to detect calls
      //   trigger();

      //   expect(eventSpy.emit).toHaveBeenCalled();

      //   const api = {
      //     withArgs(eventArgs: any) {
      //       expect(eventSpy.emit).toHaveBeenCalledWith(eventArgs);
      //       return api;
      //     },
      //     times(times: number) {
      //       expect(eventSpy.emit).toHaveBeenCalledTimes(times);
      //       return api;
      //     },
      //   };

      //   return api;
      // },
    };
  };
}

function resolve<
  Html extends Element,
  Type,
  HostHtml extends Element,
  HostType,
>(
  ref: () => NgtxElement<Html, Type>,
  fx: NgtxFixture<Html, HostType>,
): NgtxElement<Html, Type>;
function resolve<
  Html extends Element,
  Type,
  HostHtml extends Element,
  HostType,
>(
  ref: 'host',
  fx: NgtxFixture<Html, HostType>,
): NgtxElement<HostHtml, HostType>;
function resolve<
  Html extends Element,
  Type,
  HostHtml extends Element,
  HostType,
>(
  ref: PartRef<Html, Type>,
  fx: NgtxFixture<HostHtml, HostType>,
): NgtxElement<Html, Type> | NgtxElement<HostHtml, HostType> {
  if (ref === 'host') {
    return fx.rootElement;
  }

  return ref();
}

// ---------------------------------------
// Module types
// ---------------------------------------

export type EffectTestingApi<
  T,
  Html extends Element = HTMLElement,
> = ReturnType<Wrapper<Html, T>['wrapped']>;

export type PartRef<Html extends Element, Type> =
  | (() => NgtxElement<Html, Type>)
  | 'host';

// workaround, see: https://stackoverflow.com/a/64919133/3063191
class Wrapper<Html extends Element, T> {
  wrapped(e: NgtxFixture<Html, T>) {
    return When<T>(e, () => {});
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
