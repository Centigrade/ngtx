import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenarioTestingHarness } from './scenario-harnesses';
import {
  NgtxScenarioSetupFnMarker,
  NgtxScenarioViewSetupFnMarker,
} from './symbols';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
export type ScenarioTestDefinition<T> = (
  fixtureRef: ComponentFixtureRef<T>,
) => void;
export type NgtxTestingFrameworkAdapter = {
  fdescribe: (title: string, suite: () => void) => void;
  describe: (title: string, suite: () => void) => void;
  beforeEach: (fn: () => void) => void;
};

export type NgtxScenarioInitProps<T> = {
  forComponent: Type<T>;
  createTestBed: () => TestBed | Promise<TestBed>;
};

export type NgtxScenarioProps<T> = NgtxScenarioInitProps<T> & {
  description: string;
  tests?: ScenarioTestDefinition<T>[];
  modificationsBeforeComponentCreation?: ScenarioSetupFn[];
  modificationsAfterComponentCreation?: ScenarioViewSetupFn<T>[];
};
export type ScenarioViewSetupFn<
  T,
  ComponentFxRef extends ComponentFixtureRef<T> = ComponentFixtureRef<T>,
> = ((fxRef: ComponentFxRef) => void) & {
  [NgtxScenarioViewSetupFnMarker]: boolean;
};
export type ScenarioSetupFn = (() => void) & {
  [NgtxScenarioSetupFnMarker]: boolean;
};

export type NgtxScenarioTestAssertionFn<Html extends HTMLElement, Component> = (
  addTests: ScenarioTestingHarness<Html, Component>['addTests'],
  harness: ScenarioTestingHarness<Html, Component>,
) => ScenarioTestDefinition<any>;

export type NgtxScenarioSetupFn<T> = ScenarioSetupFn | ScenarioViewSetupFn<T>;
