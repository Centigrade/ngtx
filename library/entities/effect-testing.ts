import { EventEmitter } from '@angular/core';
import { NgtxElement } from './element';
import { NgtxFixture } from './fixture';

export type EffectApi = ReturnType<typeof When>;

export function When(fx: NgtxFixture, spyFt: () => any) {
  return (ngtxElement: () => NgtxElement) => {
    let trigger: () => void;

    return {
      triggersEvent(eventName: string, args?: any) {
        trigger = () => {
          ngtxElement().triggerEvent(eventName, args);
          fx.detectChanges();
        };
        trigger();

        return {
          expectHostProperty(propertyName: string) {
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
          expectHostToEmit(eventName: string) {
            const eventSpy = fx.componentInstance[
              eventName
            ] as EventEmitter<any>;
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
