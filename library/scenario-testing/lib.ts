import { ChangeDetectorRef, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EmissionOptions } from '../declarative-testing/types';
import { StateWithUnwrappedSignals } from '../types';
import {
  adaptExpectedValuesToFoundTargets,
  asArray,
  inputsOf,
  isWritableSignal,
  keysOf,
  toHtmlString,
  toSimpleChanges,
} from '../utility';
import { isNgtxElementOrMultiElement } from '../utility/type-guards';
import {
  ComponentFixtureRef,
  DebugOptions,
  NgtxChildComponentTestCaseGeneratorFn,
  NgtxScenarioTestingHarnessExtensionFn,
  ScenarioTestingSetupFn,
} from './types';

//#region scenario setup fns
export function withHost() {
  const getTarget = (fixtureRef: ComponentFixtureRef) =>
    fixtureRef().componentInstance;

  return {
    havingState<TComponent, TState extends TComponent>(
      state: StateWithUnwrappedSignals<TState>,
    ): ScenarioTestingSetupFn<TComponent> {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const stateProperties = Object.keys(state) as (keyof TComponent)[];

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
    emittingOnProperty$<TComponent, Property extends keyof TComponent>(
      property: Property,
      value: TComponent[Property],
    ): ScenarioTestingSetupFn<TComponent> {
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
    emitting$<TComponent>(
      value: TComponent,
    ): ScenarioTestingSetupFn<TComponent> {
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
    calling<TComponent, Property extends keyof TComponent>(
      methodName: TComponent[Property] extends (...args: any[]) => unknown
        ? Property
        : never,
      ...args: TComponent[Property] extends (...args: any[]) => unknown
        ? Parameters<TComponent[Property]>
        : never
    ): ScenarioTestingSetupFn<TComponent> {
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

export function withProvider<TToken, TState extends TToken>(
  token: Type<TToken>,
) {
  const getTarget = (fixtureRef: ComponentFixtureRef) =>
    fixtureRef().debugElement.injector.get(token);

  return {
    havingState(
      state: StateWithUnwrappedSignals<TState>,
    ): ScenarioTestingSetupFn {
      return {
        phase: 'setup',
        run: ({ fixtureRef }) => {
          const instance = getTarget(fixtureRef);
          const stateProperties = Object.keys(state) as (keyof TToken)[];

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
    emittingOnProperty$<Property extends keyof TToken>(
      property: Property,
      value: TToken[Property],
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
    emitting$(value: TToken): ScenarioTestingSetupFn {
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
    calling<Property extends keyof TToken>(
      methodName: TToken[Property] extends (...args: any[]) => unknown
        ? Property
        : never,
      ...args: TToken[Property] extends (...args: any[]) => unknown
        ? Parameters<TToken[Property]>
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
export function withDebugOutputAfterSetup<T>(
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

      // hint: detecting via ChangeDetectorRef to also update OnPush components:
      changeDetectorRef.detectChanges();
      fixture.detectChanges();
    },
  };
}
//#endregion

//#region scenario testing harness extension fns

function bind<Host, Property extends keyof Host, Component>(
  property: Property,
  opts: { to: keyof Component },
  value: Host[Property],
): NgtxChildComponentTestCaseGeneratorFn<HTMLElement, Component, Host> {
  return ({ isAssertionNegated, targetRef, fixtureRef }) => {
    const verb = isAssertionNegated ? 'not bind' : 'bind';
    const { to } = opts;

    it(`should ${verb} the "${property.toString()}" to "${to.toString()}"`, () => {
      const targets = targetRef();
      const fixture = fixtureRef();

      // TODO: set value
      fixture.componentInstance;

      for (const target of targets) {
        if (isAssertionNegated) {
          expect(target.componentInstance[to]).not.toEqual(
            fixture.componentInstance[property],
          );
        } else {
          expect(target.componentInstance[to]).toEqual(
            fixture.componentInstance[property],
          );
        }
      }
    });
  };
}

function emit<Host>(event: keyof Host, opts?: EmissionOptions) {
  return {
    on: (
      eventName: string,
      args?: any,
    ): NgtxChildComponentTestCaseGeneratorFn<HTMLElement, any, Host> => {
      return ({ isAssertionNegated, fixtureRef, targetRef }) => {
        const verb = isAssertionNegated ? 'not emit' : 'emit';

        it(`should ${verb} the event "${event.toString()}"`, () => {
          targetRef().forEach((target) => {
            // arrange
            const fixture = fixtureRef();
            const spy = jest.fn();
            fixture.debugElement.componentInstance[event].emit = spy;

            // act
            target.triggerEventHandler(eventName, args);

            // assert
            expect(spy).toHaveBeenCalledTimes(opts?.times ?? 1);

            if (opts?.arg) {
              expect(spy).toHaveBeenCalledWith(opts.arg);
            }
          });
        });
      };
    },
  };
}

export function haveProvider<T>(provider: Type<T>) {
  return {
    withState: (
      stateOrStates:
        | Partial<StateWithUnwrappedSignals<T>>
        | Partial<StateWithUnwrappedSignals<T>>[],
    ): NgtxScenarioTestingHarnessExtensionFn => {
      return ({ targetRef, displayName, isAssertionNegated }) => {
        const verb = isAssertionNegated ? 'not have' : 'have';
        const states = asArray(stateOrStates);

        for (const state of states) {
          for (const property of keysOf(state)) {
            it(`[${displayName}] should ${verb} provider with expected value on property "${property}"`, () => {
              const targets = targetRef();
              const expectedStates = adaptExpectedValuesToFoundTargets({
                valueOrValues: states,
                targets,
              });

              targets.forEach((target, index) => {
                const expectedState = expectedStates[index];
                const instance = target.injector.get(provider);

                if (isAssertionNegated) {
                  expect(instance[property]).not.toEqual(
                    expectedState[property],
                  );
                } else {
                  expect(instance[property]).toEqual(expectedState[property]);
                }
              });
            });
          }
        }
      };
    },
  };
}
//#endregion

// ---------------------------------------
// module internals
// ---------------------------------------
