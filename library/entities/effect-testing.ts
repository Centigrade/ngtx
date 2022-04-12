import { EventEmitter } from '@angular/core';
import { NgtxElement } from './element';
import { NgtxFixture } from './fixture';

export function WhenInit<Host>(fx: NgtxFixture<Host>, spyFt: () => any) {
  return <Html extends Element, Component>(
    ngtxElement: () => NgtxElement<Html, Component>,
  ) => {
    let trigger: () => void;

    return {
      emitsEvent(
        eventName: keyof Component & EventsOf<keyof Html>,
        args?: any,
      ) {
        trigger = () => {
          ngtxElement().triggerEvent(eventName as string, args);
          fx.detectChanges();
        };
        trigger();

        return {
          expectHostProperty(propertyName: keyof Host) {
            const value = fx.componentInstance[propertyName];

            return {
              toChangeToEventValue() {
                expect(value).toBe(args);
              },
              toChangeToValue(expectedValue: any) {
                expect(value).toBe(expectedValue);
              },
            };
          },
          expectHostToEmit(eventName: keyof Host) {
            const eventSpy = fx.componentInstance[
              eventName
            ] as unknown as EventEmitter<any>;
            eventSpy.emit = spyFt();
            // need to trigger again for spy to detect calls
            trigger();

            expect(eventSpy.emit).toHaveBeenCalled();

            const api = {
              withArgs(eventArgs: any) {
                expect(eventSpy.emit).toHaveBeenCalledWith(eventArgs);
                return api;
              },
              times(times: number) {
                expect(eventSpy.emit).toHaveBeenCalledTimes(times);
                return api;
              },
            };

            return api;
          },
        };
      },
    };
  };
}

// ---------------------------------------
// Module types
// ---------------------------------------

export type EffectTestingApi<T> = ReturnType<Wrapper<T>['wrapped']>;

// workaround, see: https://stackoverflow.com/a/64919133/3063191
class Wrapper<T> {
  wrapped(e: NgtxFixture<T>) {
    return WhenInit<T>(e, () => {});
  }
}

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;
