import { DebugElement, SimpleChanges, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxMultiElement } from '../entities';

export type Assignable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Fn<In, Out> = (a: In) => Out;
export type ConverterFn<Out> = Fn<any, Out>;

export interface NgtxSuite {
  useFixture<T>(fixture: ComponentFixture<T>): void;
  detectChanges<T extends LifeCycleHooks, Html extends Element = Element>(
    component: T,
    changes?: TypeObjectMap<T>,
  ): void;
  detectChanges<T extends Partial<LifeCycleHooks>>(
    component?: T,
    changes?: TypeObjectMap<T>,
  ): void;
  detectChanges(): void;

  get<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxElement<Html, Component>;
  get<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxElement<Html, Component>;
  get<Html extends Element, Component>(
    query: QueryTarget<Component>,
  ): NgtxElement<Html, Component>;

  getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: Type<Component>,
  ): NgtxMultiElement<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Component>,
  ): NgtxMultiElement<Html, Component>;
}

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
