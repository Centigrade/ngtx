import { NgtxFixture } from '../entities';
import type { NgtxTestEnv } from './declarative-testing';
import {
  Events,
  ISetSpyFactory,
  ITargetResolver,
  MultiPartRef,
  PublicApi,
  TargetRef,
} from './types';

/* 
  We use ExtensionMarker type to uniquely mark user defined functions as extension functions.
  This helps preventing confusing factory-functions creating the extension with the extension
  itself.

  Example:

  Imagine we have the beMissing function factory like that
  > const beMissing = () => (...) => { addAssertion(...) };

  Now in the tests we use it:

  > When(host)...expect(...).to(beMissing());

  This code will work as expected and of course there are no typing issues. The problem
  occurs when the user forgets to call the factory function like that:

  > ...expect(...).to(beMissing);

  In this code example typings still work, as () => is assignable to the ExtensionFn type.
  To prevent this, we mark extension functions with a special symbol, so that typescript error
  can show the mistake.
*/

export type ExtensionFnMarker = { __ngtxExtensionFn: true };

export type ExtensionFnSignature<Html extends HTMLElement, Component> = (
  target: MultiPartRef<Html, Component>,
  env: NgtxTestEnv,
  fixture: NgtxFixture<HTMLElement, any>,
) => void;

export type ExtensionFn<
  Html extends HTMLElement,
  Component,
> = ExtensionFnSignature<Html, Component> & ExtensionFnMarker;

export type DeclarativeTestingApi = ISetSpyFactory &
  (<Html extends HTMLElement, Component>(
    subject: TargetRef<Html, Component>,
  ) => PredicateApi<Html, Component>);

export interface PredicateApi<Html extends HTMLElement, Component> {
  emit(eventName: Events<Html, Component>, arg?: any): ExpectApi;
  emits(eventName: Events<Html, Component>, arg?: any): ExpectApi;

  call<Out>(
    resolver: ITargetResolver<Html, Component, Out>,
    methodName: keyof PublicApi<Out>,
    args?: any[],
  ): ExpectApi;
  calls<Out>(
    resolver: ITargetResolver<Html, Component, Out>,
    methodName: keyof PublicApi<Out>,
    args?: any[],
  ): ExpectApi;

  rendered(): ExpectApi;
  has: PredicateFn<Html, Component>;
  have: PredicateFn<Html, Component>;
  does: PredicateFn<Html, Component>;
  do: PredicateFn<Html, Component>;
  gets: PredicateFn<Html, Component>;
  get: PredicateFn<Html, Component>;
  is: PredicateFn<Html, Component>;
  are: PredicateFn<Html, Component>;
}

type PredicateFn<Html extends HTMLElement, Component> = (
  // hint: Required<Component> to normalize Component's type, so that extension-fns
  // using "keyof Component" can safely use all of them, even keys being optional (e.g. age?: number).
  ...predicates: ExtensionFn<Html, Required<Component>>[]
) => ExpectApi;

export interface ExpectApi {
  and: DeclarativeTestingApi;
  expect<Html extends HTMLElement, Component>(
    object: TargetRef<Html, Component>,
  ): AssertionApi<Html, Component>;
}

export interface AssertionApi<Html extends HTMLElement, Component> {
  not: AssertionApi<Html, Component>;
  to(...assertions: ExtensionFn<Html, Required<Component>>[]): void;
}
