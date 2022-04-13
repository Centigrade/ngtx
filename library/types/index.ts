import { DebugElement, SimpleChanges, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxFixture } from '../entities';
import { DeclarativeTestingApi } from '../features/declarative-testing';

export type Assignable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type NgtxSuite<T> = Omit<
  NgtxFixture<any, any>,
  'rootElement' | 'useFixture'
> & {
  useFixture(fixture: ComponentFixture<T>, opts?: UseFixtureOptions): void;
  When: DeclarativeTestingApi<T>;
  host(): NgtxElement<any, T>;
};

export interface UseFixtureOptions {
  skipInitialChangeDetection?: boolean;
  spyFactory?: () => any;
}

export type Fn<In, Out> = (a: In) => Out;
export type ConverterFn<Out> = Fn<any, Out>;

export interface LifeCycleHooks {
  ngOnInit?: () => void;
  ngOnChanges?: (changes: SimpleChanges) => void;
}

export type QueryTarget<Component> = string | Type<Component>;

export interface TypedDebugElement<
  Html extends Element = Element,
  Component = any,
> extends DebugElement {
  nativeElement: Html;
  componentInstance: Component;
}

export type TypeObjectMap<K> = Partial<{
  [P in keyof Partial<K>]: any;
}>;

export type Chainable<
  Html extends Element = Element,
  Component = any,
> = TypedDebugElement<Html, Component> & NgtxElement;
