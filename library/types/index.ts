import { DebugElement, SimpleChanges, Type } from '@angular/core';
import { NgtxElement } from '../api';

export type Fn<In, Out> = (a: In) => Out;
export type ConverterFn<Out> = Fn<any, Out>;

export interface LifeCycleHooks {
  ngOnInit?: () => void;
  ngOnChanges?: (changes: SimpleChanges) => void;
}

export type QueryTarget<Html extends Element, Component> =
  | string
  | Type<Component>;

export interface TypedDebugElement<
  Html extends Element = Element,
  Component = any
> extends DebugElement {
  nativeElement: Html;
  componentInstance: Component;
}

export type TypeObjectMap<K> = Partial<
  {
    [P in keyof Partial<K>]: any;
  }
>;

export type Chainable<
  Html extends Element = Element,
  Component = any
> = TypedDebugElement<Html, Component> & NgtxElement;
