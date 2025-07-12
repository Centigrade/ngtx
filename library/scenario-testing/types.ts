import { Signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { QueryTarget, TypedDebugElement } from '../types';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
export type StateWithUnwrappedSignals<T> = Partial<{
  [p in keyof T]: T[p] extends Signal<infer V> ? V : T[p];
}>;

export type RemoteLogicFn<T> = (ctx: RemoteLogicContext<T>) => unknown;
export type RemoteLogicContext<T> = {
  fixtureRef: ComponentFixtureRef<T>;
  query: <Html extends HTMLElement, Component>(
    target: QueryTarget<Component> | undefined,
  ) => TypedDebugElement<Html, Component>;
};
export type NgtxScenarioTestingHarnessExtensionContext<
  Html extends HTMLElement,
  Component,
> = RemoteLogicContext<any> & {
  targetRef: () => TypedDebugElement<Html, Component>;
  displayName: string;
  isAssertionNegated: boolean;
};
export type NgtxScenarioTestingExtensionFn = RemoteLogicFn<any>;
export type NgtxScenarioTestingHarnessExtensionFn<
  Html extends HTMLElement = HTMLElement,
  Component = any,
> = (
  ctx: NgtxScenarioTestingHarnessExtensionContext<Html, Component>,
) => unknown;

export type NgtxTestingFrameworkAdapter = {
  describe: any;
  fdescribe: any;
  beforeEach: any;
};

export type TestScenarioOptions = {
  displayName: string;
};
