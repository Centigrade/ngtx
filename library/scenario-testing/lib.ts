import { Type } from '@angular/core';
import { NgtxScenarioTestingExtensionFn } from './types';

export function withInitialChangeDetection(): NgtxScenarioTestingExtensionFn {
  return ({ fixtureRef }) => fixtureRef().detectChanges();
}

export function withProvider<T>(token: Type<T>) {
  return class {
    static havingState(
      state: T & Record<string, any>,
    ): NgtxScenarioTestingExtensionFn {
      return ({ fixtureRef }) => {
        const injector = fixtureRef().debugElement.injector;
        const instance = injector.get(token);

        const objectKeys = Object.keys(state) as (keyof T)[];
        for (const key of objectKeys) {
          instance[key] = state[key];
        }
      };
    }
  };
}
