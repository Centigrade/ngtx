import { NgtxElement, NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';

export interface EmissionOptions {
  args?: any;
  times?: number;
  whichReturns?: any;
}

export type PartRef<Html extends HTMLElement, Type> = () => NgtxElement<
  Html,
  Type
>;

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;

export interface DeclarativeTestState<Subject = any, Object = any> {
  subject?: PartRef<any, Subject>;
  predicate?: () => void;
  object?: PartRef<any, Object>;
  assertion?: () => void;
}

export type DeclarativeTestExtension<
  Html extends HTMLElement,
  Component,
  Subject = any,
  Object = any,
> = (
  input: DeclarativeTestState<Subject, Object>,
  fixture: NgtxFixture<Html, Component>,
  spyFactory: SpyFactoryFn,
) => DeclarativeTestState<Subject, Object>;
