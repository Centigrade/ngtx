import { Signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { TargetRef } from '../declarative-testing/types';
import { QueryTarget, TypedDebugElement } from '../types';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
export type StateWithUnwrappedSignals<T> = Partial<{
  [p in keyof T]: T[p] extends Signal<infer V> ? V : T[p];
}>;

type SetupPhase = 'setup' | 'afterSetup';
export type SetupInstruction<T> = {
  phase: SetupPhase;
  run: TestActionFn<T>;
};
export type TestActionFn<T> = (ctx: SetupActionContext<T>) => unknown;
export type SetupActionContext<T> = {
  fixtureRef: ComponentFixtureRef<T>;
  query: <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
  ) => TypedDebugElement<Html, Component>;
};
export type ScenarioTestingHarnessExtensionContext<
  Html extends HTMLElement,
  Component,
> = SetupActionContext<any> & {
  targetRef: () => TypedDebugElement<Html, Component>;
  displayName: string;
  isAssertionNegated: boolean;
};
export type ScenarioTestCaseGeneratorFn = TestActionFn<any>;
export type ScenarioTestingSetupFn<T = any> = SetupInstruction<T>;
export type NgtxScenarioTestingHarnessExtensionFn<
  Html extends HTMLElement = HTMLElement,
  Component = any,
> = (ctx: ScenarioTestingHarnessExtensionContext<Html, Component>) => unknown;

export type NgtxTestingFrameworkAdapter = {
  describe: any;
  fdescribe: any;
  beforeEach: any;
};

export type TestScenarioOptions = {
  displayName: string;
};

export interface DebugOptions<T> {
  stateOf?: QueryTarget<T> | TargetRef<HTMLElement, T>;
  map?: (state: T) => unknown;
}
