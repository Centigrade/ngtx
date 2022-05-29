import { NgtxFixture } from '../entities';
import {
  DeclarativeTestState,
  ISetSpyFactory,
  MultiPartRef,
  SpyOnFn,
  TargetRef,
} from './types';

export type DeclarativeTestingApi = ISetSpyFactory &
  (<Html extends HTMLElement, Component>(
    subject: TargetRef<Html, Component>,
  ) => PredicateApi<Html, Component>);

export interface PredicateApi<Html extends HTMLElement, Component> {
  has: PredicateFn<Html, Component>;
  have: PredicateFn<Html, Component>;
  does: PredicateFn<Html, Component>;
  do: PredicateFn<Html, Component>;
  gets: PredicateFn<Html, Component>;
  get: PredicateFn<Html, Component>;
  is: PredicateFn<Html, Component>;
  are: PredicateFn<Html, Component>;
  calls: (callImplementationFn: ExtensionFn<Html, Component>) => ExpectApi;
  emits: (emitImplementationFn: ExtensionFn<Html, Component>) => ExpectApi;
  emit: (emitImplementationFn: ExtensionFn<Html, Component>) => ExpectApi;
}

type PredicateFn<Html extends HTMLElement, Component> = (
  // hint: Required<Component> to normalize Component's type, so that extension-fns
  // using "keyof Component" can safely use all of them, even keys being optional (e.g. age?: number).
  ...predicates: ExtensionFn<Html, Required<Component>>[]
) => ExpectApi;

export type ExtensionFn<Html extends HTMLElement, Component> = (
  target: MultiPartRef<Html, Component>,
  state: DeclarativeTestState,
  fixture: NgtxFixture<HTMLElement, any>,
  spyOn: SpyOnFn,
) => DeclarativeTestState;

export interface ExpectApi {
  and: DeclarativeTestingApi;
  expect<Html extends HTMLElement, Component>(
    object: TargetRef<Html, Component>,
  ): AssertionApi<Html, Component>;
}

export interface AssertionApi<Html extends HTMLElement, Component> {
  to(...assertions: ExtensionFn<Html, Required<Component>>[]): void;
}
