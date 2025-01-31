import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Type } from 'ng-mocks';
import { NGTX_GLOBAL_CONFIG } from '../global-config';
import { TypedDebugElement } from '../types';
import {
  ComponentFixtureRef,
  NgtxScenarioInitProps,
  NgtxScenarioProps,
  NgtxTestingFrameworkAdapter,
  ScenarioTestDefinition,
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
    selector: string,
  ): () => TypedDebugElement<Html, Component>;
  public query<Html extends HTMLElement, Component>(
    type: Type<Component>,
  ): () => TypedDebugElement<Html, Component>;
  public query<Html extends HTMLElement, Component>(
    selector: string | Type<Component>,
  ): () => TypedDebugElement<Html, Component> {
    return () => {
      const fixture = this.fixtureRef();

      if (!fixture) {
        throw new Error('Fixture not set');
      }

      if (typeof selector === 'string') {
        return fixture!.debugElement.query(By.css(selector))!;
      }

      return fixture!.debugElement.query(By.directive(selector))!;
    };
  }

  public run() {
    const { _framework, _moduleConfig, _componentType, scenarios } = this;
    const { describe, beforeEach } = _framework;

    for (const scenario of scenarios) {
      describe(scenario['_description'], () => {
        beforeEach(async () => {
          await TestBed.configureTestingModule(
            _moduleConfig,
          ).compileComponents();

          scenario['_runModificationsBeforeComponentCreation']();
          this.fixture = TestBed.createComponent(_componentType);
          scenario['_runModificationsAfterComponentCreation'](this.fixtureRef);
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
      props.moduleConfig,
      props.componentType,
      props.modificationsBeforeComponentCreation ?? [],
      props.modificationsAfterComponentCreation ?? [],
      props.tests ?? [],
    );
  }

  private constructor(
    private readonly _description: string,
    private readonly _testEnvironment: NgtxScenarioTestEnvironment<T>,
    private readonly _moduleConfig: TestModuleMetadata,
    private readonly _componentType: Type<T>,
    private readonly _modificationsBeforeComponentCreation: (() => void)[],
    private readonly _modificationsAfterComponentCreation: ((
      fxRef: ComponentFixtureRef<T>,
    ) => void)[],
    private readonly tests: ScenarioTestDefinition<T>[],
  ) {}

  configure(...mods: (() => void)[]): NgtxTestScenario<T> {
    const scenario = NgtxTestScenario.from(
      {
        componentType: this._componentType,
        description: this._description,
        moduleConfig: this._moduleConfig,
        modificationsBeforeComponentCreation: [
          ...this._modificationsBeforeComponentCreation,
          ...mods,
        ],
        modificationsAfterComponentCreation:
          this._modificationsAfterComponentCreation,
        tests: this.tests,
      },
      this._testEnvironment,
    );

    return scenario;
  }

  whenComponentReady(
    ...mods: ((fxRef: ComponentFixtureRef<T>) => void)[]
  ): NgtxTestScenario<T> {
    const scenario = NgtxTestScenario.from(
      {
        componentType: this._componentType,
        description: this._description,
        moduleConfig: this._moduleConfig,
        modificationsBeforeComponentCreation:
          this._modificationsBeforeComponentCreation,
        modificationsAfterComponentCreation: [
          ...this._modificationsAfterComponentCreation,
          ...mods,
        ],
        tests: this.tests,
      },
      this._testEnvironment,
    );

    return scenario;
  }

  expect(...tests: ScenarioTestDefinition<T>[]): void {
    const scenario = NgtxTestScenario.from(
      {
        componentType: this._componentType,
        description: this._description,
        moduleConfig: this._moduleConfig,
        modificationsBeforeComponentCreation:
          this._modificationsBeforeComponentCreation,
        modificationsAfterComponentCreation:
          this._modificationsAfterComponentCreation,
        tests: [...this.tests, ...tests],
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

export function useTestBed<T>(
  props: Omit<NgtxScenarioInitProps<T>, 'description'>,
) {
  const environment = new NgtxScenarioTestEnvironment(
    NGTX_GLOBAL_CONFIG.testingFrameworkAdapter!,
    props.moduleConfig,
    props.componentType,
  );

  return {
    scenario: (description: string) =>
      NgtxTestScenario.from({ ...props, description }, environment),
    tests: environment,
  };
}

// ----------------------------
// Harness System
// ----------------------------

export class NgtxScenarioTestHarness<Html extends HTMLElement, Component> {
  constructor(
    public readonly selector: string | Type<Component>,
    private readonly testEnv: NgtxScenarioTestEnvironment<any>,
    public readonly name = typeof selector === 'string'
      ? selector
      : selector.name,
  ) {}

  public fixtureRef!: ComponentFixtureRef<Component>;

  public provideTests(tests: () => unknown) {
    return (fxRef: ComponentFixtureRef<Component>) => {
      this.fixtureRef = fxRef;
      tests();
    };
  }

  get debugElement() {
    return this.testEnv.query(this.selector as any)() as TypedDebugElement<
      Html,
      Component
    >;
  }
}
