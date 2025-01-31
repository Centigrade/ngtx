import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Type } from 'ng-mocks';
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
    readonly framework: NgtxTestingFrameworkAdapter,
    readonly moduleConfig: TestModuleMetadata,
    readonly componentType: Type<T>,
  ) {}

  public addScenario(scenario: NgtxTestScenario<T>) {
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
    const { framework, moduleConfig, componentType, scenarios } = this;
    const { describe, beforeEach } = framework;

    for (const scenario of scenarios) {
      describe(scenario.description, () => {
        beforeEach(async () => {
          await TestBed.configureTestingModule(
            moduleConfig,
          ).compileComponents();

          scenario['_runModificationsBeforeComponentCreation']();
          this.fixture = TestBed.createComponent(componentType);
          scenario['_runModificationsAfterComponentCreation'](this.fixtureRef);
        });

        scenario.run(this.fixtureRef);
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
      props.testingFrameworkAdapter,
      props.moduleConfig,
      props.componentType,
      props.modificationsBeforeComponentCreation ?? [],
      props.modificationsAfterComponentCreation ?? [],
      props.tests ?? [],
    );
  }

  private constructor(
    readonly description: string,
    readonly testEnvironment: NgtxScenarioTestEnvironment<T>,
    readonly testingFrameworkAdapter: NgtxTestingFrameworkAdapter,
    readonly moduleConfig: TestModuleMetadata,
    readonly componentType: Type<T>,
    readonly modificationsBeforeComponentCreation: (() => void)[],
    readonly modificationsAfterComponentCreation: ((
      fxRef: ComponentFixtureRef<T>,
    ) => void)[],
    readonly tests: ScenarioTestDefinition<T>[],
  ) {}

  configure(...mods: (() => void)[]): NgtxTestScenario<T> {
    const scenario = NgtxTestScenario.from(
      {
        ...this,
        modificationsBeforeComponentCreation: [
          ...this.modificationsBeforeComponentCreation,
          ...mods,
        ],
      },
      this.testEnvironment,
    );

    return scenario;
  }

  whenComponentReady(
    ...mods: ((fxRef: ComponentFixtureRef<T>) => void)[]
  ): NgtxTestScenario<T> {
    const scenario = NgtxTestScenario.from(
      {
        ...this,
        modificationsAfterComponentCreation: [
          ...this.modificationsAfterComponentCreation,
          ...mods,
        ],
      },
      this.testEnvironment,
    );

    return scenario;
  }

  expect(...tests: ScenarioTestDefinition<T>[]): void {
    const scenario = NgtxTestScenario.from(
      {
        ...this,
        tests: [...this.tests, ...tests],
      },
      this.testEnvironment,
    );

    this.testEnvironment.addScenario(scenario);
  }

  private _runModificationsBeforeComponentCreation() {
    this.modificationsBeforeComponentCreation.forEach((mod) => mod());
  }

  private _runModificationsAfterComponentCreation(
    fxRef: ComponentFixtureRef<T>,
  ) {
    this.modificationsAfterComponentCreation.forEach((mod) => mod(fxRef));
  }

  run(fixtureRef: ComponentFixtureRef<T>) {
    this.tests.forEach((test) => test(fixtureRef));
  }
}

export function useScenario<T>(
  props: Omit<NgtxScenarioInitProps<T>, 'description'>,
) {
  const environment = new NgtxScenarioTestEnvironment(
    props.testingFrameworkAdapter,
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
