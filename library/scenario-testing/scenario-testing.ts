import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
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
    private readonly _moduleConfig: TestModuleMetadata,
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
    const { _framework, _moduleConfig, _componentType, scenarios } = this;
    const { describe, fdescribe, beforeEach } = _framework;

    for (const scenario of scenarios) {
      const descriptor = scenario['_runFocused'] ? fdescribe : describe;

      descriptor(scenario['_description'], () => {
        beforeEach(async () => {
          await TestBed.configureTestingModule(
            _moduleConfig,
          ).compileComponents();

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
      props.runFocused,
      environment,
      props.moduleConfig,
      props.componentType,
      props.modificationsBeforeComponentCreation ?? [],
      props.modificationsAfterComponentCreation ?? [],
      props.tests ?? [],
    );
  }

  private constructor(
    private readonly _description: string,
    private readonly _runFocused: boolean,
    private readonly _testEnvironment: NgtxScenarioTestEnvironment<T>,
    private readonly _moduleConfig: TestModuleMetadata,
    private readonly _componentType: Type<T>,
    private readonly _modificationsBeforeComponentCreation: ScenarioSetupFn[],
    private readonly _modificationsAfterComponentCreation: ScenarioViewSetupFn<T>[],
    private readonly tests: ScenarioTestDefinition<T>[],
  ) {}

  setup(
    ...mods: (ScenarioSetupFn | ScenarioViewSetupFn<T>)[]
  ): NgtxTestScenario<T> {
    const scenarioMods = mods.filter((mod) => ngtx.is(mod, 'scenarioSetupFn'));
    const viewMods = mods.filter((mod) => ngtx.is(mod, 'scenarioViewSetupFn'));

    const scenario = NgtxTestScenario.from(
      {
        componentType: this._componentType,
        description: this._description,
        runFocused: this._runFocused,
        moduleConfig: this._moduleConfig,
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

  expect(
    ...tests: (ScenarioTestDefinition<T> | ScenarioTestDefinition<T>[])[]
  ): void {
    const scenario = NgtxTestScenario.from(
      {
        componentType: this._componentType,
        description: this._description,
        runFocused: this._runFocused,
        moduleConfig: this._moduleConfig,
        modificationsBeforeComponentCreation:
          this._modificationsBeforeComponentCreation,
        modificationsAfterComponentCreation:
          this._modificationsAfterComponentCreation,
        tests: [...this.tests, ...tests].flat(1),
      },
      this._testEnvironment,
    );

    this._testEnvironment['_addScenario'](scenario);
  }

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
    props.moduleConfig,
    props.componentType,
  );

  let runScenarioFocused = false;
  const only = (userScenarios: () => unknown) => {
    runScenarioFocused = true;
    userScenarios();
    runScenarioFocused = false;
  };

  const controlLevelExpect: NgtxTestScenario<T>['expect'] = (...scenarios) => {
    return NgtxTestScenario.from(
      { ...props, runFocused: runScenarioFocused, description: 'Control' },
      environment,
    ).expect(...scenarios);
  };

  return {
    only,
    scenario: (description: string) =>
      NgtxTestScenario.from(
        { ...props, runFocused: runScenarioFocused, description },
        environment,
      ),
    expect: controlLevelExpect,
    tests: environment,
  };
}
