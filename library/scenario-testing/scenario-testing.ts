import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Type } from 'ng-mocks';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { ngtx } from '../ngtx';
import { TypedDebugElement } from '../types';
import { isNgtxQuerySelector, queryNgtxMarker } from '../utility';
import {
  ComponentFixtureRef,
  NgtxScenarioInitProps,
  NgtxScenarioProps,
  NgtxScenarioSetupFn,
  NgtxTestingFrameworkAdapter,
  ScenarioSetupFn,
  ScenarioTestDefinition,
  ScenarioViewSetupFn,
} from './types';

export class NgtxScenarioTestEnvironment<T> {
  private scenarios: NgtxTestScenario<T>[] = [];
  private fixture!: ComponentFixture<T>;
  private readonly fixtureRef: ComponentFixtureRef<T> = () => this.fixture;

  constructor(
    private readonly _framework: NgtxTestingFrameworkAdapter,
    private readonly _testBedRef: () => TestBed | Promise<TestBed>,
    private readonly _componentType: Type<T>,
  ) {}

  private _addScenario(scenario: NgtxTestScenario<T>) {
    this.scenarios = [...this.scenarios, scenario];
  }

  public query<Html extends HTMLElement, Component>(
    query: string,
  ): () => TypedDebugElement<Html, Component>;
  public query<Html extends HTMLElement, Component>(
    type: Type<Component>,
  ): () => TypedDebugElement<Html, Component>;
  public query<Html extends HTMLElement, Component>(
    query: string | Type<Component>,
  ): () => TypedDebugElement<Html, Component> {
    return () => {
      const fixture = this.fixtureRef();

      return isNgtxQuerySelector(query)
        ? queryNgtxMarker(query as string, fixture.debugElement)
        : typeof query === 'string'
        ? fixture.debugElement.query(By.css(query))
        : fixture.debugElement.query(By.directive(query));
    };
  }

  public run() {
    const { _framework, _testBedRef, _componentType, scenarios } = this;
    const { describe, fdescribe, beforeEach } = _framework;

    for (const scenario of scenarios) {
      const descriptor = scenario['_runFocused'] ? fdescribe : describe;

      descriptor(scenario['_description'], () => {
        beforeEach(async () => {
          const resolvedTestBed = await _testBedRef();
          await resolvedTestBed.compileComponents();

          scenario['_runModificationsBeforeComponentCreation']();
          this.fixture = TestBed.createComponent(_componentType);
          scenario['_runModificationsAfterComponentCreation'](this.fixtureRef);
          this.fixture.detectChanges();
        });

        scenario['_run'](this.fixtureRef);
      });
    }
  }
}

export class NgtxTestScenario<T = any> {
  static from<T>(
    props: NgtxScenarioProps<T>,
    environment: NgtxScenarioTestEnvironment<T>,
  ): NgtxTestScenario<T> {
    return new NgtxTestScenario(
      props.description,
      environment,
      props.createTestBed,
      props.forComponent,
      props.modificationsBeforeComponentCreation ?? [],
      props.modificationsAfterComponentCreation ?? [],
      props.tests ?? [],
    );
  }

  private _runFocused: boolean;

  private constructor(
    private readonly _description: string,
    private readonly _testEnvironment: NgtxScenarioTestEnvironment<T>,
    private readonly _testBedRef: () => TestBed | Promise<TestBed>,
    private readonly _componentType: Type<T>,
    private readonly _modificationsBeforeComponentCreation: ScenarioSetupFn[],
    private readonly _modificationsAfterComponentCreation: ScenarioViewSetupFn<T>[],
    private readonly tests: ScenarioTestDefinition<T>[],
  ) {}

  setup(
    ...mods: (NgtxScenarioSetupFn<T> | NgtxScenarioSetupFn<T>[])[]
  ): NgtxTestScenario<T> {
    const flattened = mods.flat(1);
    const scenarioMods = flattened.filter((mod) =>
      ngtx.is(mod, 'scenarioSetupFn'),
    );
    const viewMods = flattened.filter((mod) =>
      ngtx.is(mod, 'scenarioViewSetupFn'),
    );

    const scenario = NgtxTestScenario.from(
      {
        forComponent: this._componentType,
        description: this._description,
        createTestBed: this._testBedRef,
        modificationsBeforeComponentCreation: [
          ...this._modificationsBeforeComponentCreation,
          ...scenarioMods,
        ],
        modificationsAfterComponentCreation: [
          ...this._modificationsAfterComponentCreation,
          ...viewMods,
        ],
        tests: this.tests,
      },
      this._testEnvironment,
    );

    return scenario;
  }

  readonly expect = createExpect(this);

  private _runModificationsBeforeComponentCreation() {
    this._modificationsBeforeComponentCreation.forEach((mod) => mod());
  }

  private _runModificationsAfterComponentCreation(
    fxRef: ComponentFixtureRef<T>,
  ) {
    this._modificationsAfterComponentCreation.forEach((mod) => mod(fxRef));
  }

  private _run(fixtureRef: ComponentFixtureRef<T>) {
    this.tests.forEach((test) => test(fixtureRef));
  }
}

export function useScenarioTesting<T>(
  props: Omit<NgtxScenarioInitProps<T>, 'description'>,
) {
  const environment = new NgtxScenarioTestEnvironment(
    NGTX_GLOBAL_CONFIG.testingFrameworkAdapter!,
    props.createTestBed,
    props.forComponent,
  );

  return {
    scenario: (description: string) =>
      NgtxTestScenario.from({ ...props, description }, environment),

    tests: environment,
  };
}

function createExpect<T>(fromScenario: NgtxTestScenario<T>) {
  let focussed = false;
  const addExpectationsAndAddScenarioToTestEnv = (
    ...tests: (ScenarioTestDefinition<T> | ScenarioTestDefinition<T>[])[]
  ) => {
    const scenario = NgtxTestScenario.from(
      {
        forComponent: fromScenario['_componentType'],
        description: fromScenario['_description'],
        createTestBed: fromScenario['_testBedRef'],
        modificationsBeforeComponentCreation:
          fromScenario['_modificationsBeforeComponentCreation'],
        modificationsAfterComponentCreation:
          fromScenario['_modificationsAfterComponentCreation'],
        tests: [...fromScenario['tests'], ...tests].flat(1),
      },
      fromScenario['_testEnvironment'],
    );

    scenario['_runFocused'] = focussed;

    fromScenario['_testEnvironment']['_addScenario'](scenario);
  };

  return Object.assign(addExpectationsAndAddScenarioToTestEnv, {
    only: (
      ...tests: (ScenarioTestDefinition<T> | ScenarioTestDefinition<T>[])[]
    ) => {
      focussed = true;
      addExpectationsAndAddScenarioToTestEnv(...tests);
    },
  });
}
