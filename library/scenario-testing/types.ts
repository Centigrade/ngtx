import { Type } from '@angular/core';
import { ComponentFixture, TestModuleMetadata } from '@angular/core/testing';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
export type ScenarioTestDefinition<T> = (
  fixtureRef: ComponentFixtureRef<T>,
) => void;
export type NgtxTestingFrameworkAdapter = {
  describe: (title: string, suite: () => void) => void;
  beforeEach: (fn: () => void) => void;
};

export type NgtxScenarioInitProps<T> = {
  componentType: Type<T>;
  moduleConfig: TestModuleMetadata;
  testingFrameworkAdapter: NgtxTestingFrameworkAdapter;
};
export type NgtxScenarioProps<T> = NgtxScenarioInitProps<T> & {
  description: string;
  tests?: ScenarioTestDefinition<T>[];
  modificationsBeforeComponentCreation?: (() => void)[];
  modificationsAfterComponentCreation?: ((
    fxRef: ComponentFixtureRef<T>,
  ) => void)[];
};
