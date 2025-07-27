import { ChangeDetectorRef, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { StateWithUnwrappedSignals } from '../types';
import { toHtmlString } from '../utility';
import { inputsOf, toSimpleChanges } from '../utility/angular.utilities';
import { isWritableSignal } from '../utility/signals';
import { isNgtxElementOrMultiElement } from '../utility/type-guards';
import {
  ComponentFixtureRef,
  DebugOptions,
  ScenarioTestingSetupFn,
} from './types';

//#region scenario setup fns
export function withHost() {
  const getTarget = (fixtureRef: ComponentFixtureRef) =>
    fixtureRef().componentInstance;

  return {
    havingState<T>(
      state: StateWithUnwrappedSignals<T>,
    ): ScenarioTestingSetupFn<T> {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const stateProperties = Object.keys(state) as (keyof T)[];

          for (const property of stateProperties) {
            if (isWritableSignal(instance[property])) {
              instance[property].set(state[property]!);
              continue;
            }

            (instance as any)[property] = state[property];
          }
        },
      };
    },
    emittingOnProperty$<T, Property extends keyof T>(
      property: Property,
      value: T[Property],
    ): ScenarioTestingSetupFn<T> {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const subject: any = instance[property];

          if ('next' in subject) {
            subject.next(value);
          }
        },
      };
    },
    emitting$<T>(value: T): ScenarioTestingSetupFn<T> {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const subject: any = instance;

          if ('next' in subject) {
            subject.next(value);
          }
        },
      };
    },
    calling<T, Property extends keyof T>(
      methodName: T[Property] extends (...args: any[]) => unknown
        ? Property
        : never,
      ...args: T[Property] extends (...args: any[]) => unknown
        ? Parameters<T[Property]>
        : never
    ): ScenarioTestingSetupFn<T> {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const method = instance[methodName] as (...args: any[]) => unknown;
          method.call(instance, ...args);
        },
      };
    },
  };
}

export function withProvider<T>(token: Type<T>) {
  const getTarget = (fixtureRef: ComponentFixtureRef) =>
    fixtureRef().debugElement.injector.get(token);

  return {
    havingState(state: StateWithUnwrappedSignals<T>): ScenarioTestingSetupFn {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const stateProperties = Object.keys(state) as (keyof T)[];

          for (const property of stateProperties) {
            if (isWritableSignal(instance[property])) {
              instance[property].set(state[property]!);
              continue;
            }

            (instance as any)[property] = state[property];
          }
        },
      };
    },
    emittingOnProperty$<Property extends keyof T>(
      property: Property,
      value: T[Property],
    ): ScenarioTestingSetupFn {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const subject: any = instance[property];

          if ('next' in subject) {
            subject.next(value);
          }
        },
      };
    },
    emitting$(value: T): ScenarioTestingSetupFn {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const subject: any = instance;

          if ('next' in subject) {
            subject.next(value);
          }
        },
      };
    },
    calling<Property extends keyof T>(
      methodName: T[Property] extends (...args: any[]) => unknown
        ? Property
        : never,
      ...args: T[Property] extends (...args: any[]) => unknown
        ? Parameters<T[Property]>
        : never
    ): ScenarioTestingSetupFn {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const method = instance[methodName] as (...args: any[]) => unknown;
          method.call(instance, ...args);
        },
      };
    },
  };
}

export function withRouteParams(
  params: Record<string, unknown>,
): ScenarioTestingSetupFn {
  return {
    phase: 'setup',
    run: ({ fixtureRef }) => {
      const activatedRoute =
        fixtureRef().debugElement.injector.get(ActivatedRoute);

      activatedRoute.params = new BehaviorSubject(params);
      activatedRoute.snapshot.params = params;
    },
  };
}
//#endregion

//#region after scenario setup fns
export function debugAfterSetup<T>(
  opts: DebugOptions<T> = {},
): ScenarioTestingSetupFn {
  const { stateOf, map } = opts;

  const targetQueryOrRef = stateOf as any;
  const identity = (v: unknown) => v;
  const mapFn = map ?? identity;

  return {
    phase: 'afterSetup',
    run: ({ fixtureRef, query }) => {
      console.log(toHtmlString(fixtureRef().nativeElement));

      if (targetQueryOrRef) {
        if (typeof targetQueryOrRef === 'function') {
          const maybeNgtxElement = targetQueryOrRef();
          const componentInstances = isNgtxElementOrMultiElement(
            maybeNgtxElement,
          )
            ? 'componentInstance' in maybeNgtxElement
              ? [maybeNgtxElement.componentInstance]
              : maybeNgtxElement.unwrap().map((e) => e.componentInstance)
            : query(targetQueryOrRef, {
                name: '',
                filter: () => true,
              }).map((t) => t.componentInstance);

          console.log('Component state(s):');
          const isMappedHint = map != undefined ? ' (mapped)' : '';
          componentInstances
            .map((value) => [value.constructor.name, mapFn(value)] as const)
            .forEach(([componentName, state], index) =>
              console.log(
                `------- state of: ${componentName} #${
                  index + 1
                }${isMappedHint} --------\n`,
                state,
                `\n\n`,
              ),
            );
        }
      }
    },
  };
}

export function withChangeDetectionAfterSetup(): ScenarioTestingSetupFn {
  return {
    phase: 'afterSetup',
    run: ({ fixtureRef }) => {
      const fixture = fixtureRef();
      const changeDetectorRef =
        fixture.debugElement.injector.get(ChangeDetectorRef);
      const component = fixture.debugElement.componentInstance;
      const componentInputs = inputsOf(component);

      if ('ngOnChanges' in component) {
        const changes = toSimpleChanges(componentInputs);
        component.ngOnChanges(changes);
      }
      if ('ngOnInit' in component) {
        component.ngOnInit();
      }
      // TODO: other hooks

      // hint: detecting via ChangeDetectorRef also updates OnPush components:
      changeDetectorRef.detectChanges();
    },
  };
}
//#endregion

//#region scenario testing harness extension fns

//#endregion

// ---------------------------------------
// module internals
// ---------------------------------------
