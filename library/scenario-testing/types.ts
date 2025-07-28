import { ComponentFixture } from '@angular/core/testing';
import { TargetRef } from '../declarative-testing/types';
import { QueryTarget, TypedDebugElement } from '../types';
import { ScenarioTestingHarness } from './scenario-testing';

//#region general types
export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;

//#endregion

//#region configuration types
export type NgtxTestingFrameworkAdapter = {
  describe: any;
  fdescribe: any;
  beforeEach: any;
};
//#endregion

//#region lib types
export interface DebugOptions<T> {
  stateOf?: QueryTarget<T> | TargetRef<HTMLElement, T>;
  map?: (state: T) => unknown;
}

//#endregion

//#region scenario testing class types
export type TestScenarioOptions = {
  skipInitialChangeDetection?: boolean;
};
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
//#endregion

//#region harness types
export type ScenarioTestingHarnessOptions = {
  displayName: string;
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
export type NgtxChildComponentTestCaseGeneratorFn<
  Html extends HTMLElement = HTMLElement,
  Component = any,
> = (
  ctx: ScenarioTestingHarnessWithoutFilters<Html, Component> &
    ScenarioTestingHarnessExtensionContext<Html, Component>,
) => unknown;

export type ScenarioTestingHarnessWithoutFilters<
  Html extends HTMLElement,
  Component,
> = Omit<
  ScenarioTestingHarness<Html, Component>,
  'nth' | 'first' | 'last' | 'range' | 'where'
>;
//#endregion
