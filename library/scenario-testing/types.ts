import { ComponentFixture } from '@angular/core/testing';
import { TargetRef } from '../declarative-testing/types';
import { QueryTarget, TypedDebugElement } from '../types';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
type SetupPhase = 'setup' | 'afterSetup';
export type SetupInstruction<T> = {
  phase: SetupPhase;
  run: TestActionFn<T>;
};
export type TestActionFn<T> = (ctx: TestActionContext<T>) => unknown;

export type TargetFilter<Html extends HTMLElement, Component> = {
  name: string;
  filter: (
    item: TypedDebugElement<Html, Component>,
    index: number,
    array: TypedDebugElement<Html, Component>[],
  ) => boolean;
};

export type TestActionContext<T> = {
  fixtureRef: ComponentFixtureRef<T>;
  query: <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
    filter: TargetFilter<Html, Component>,
  ) => TypedDebugElement<Html, Component>[];
};
export type ScenarioTestingHarnessExtensionContext<
  Html extends HTMLElement,
  Component,
> = TestActionContext<any> & {
  targetRef: () => TypedDebugElement<Html, Component>[];
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
