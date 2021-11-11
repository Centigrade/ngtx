import { Type } from '@angular/core';
import { ConverterFn, QueryTarget } from './index';
import type { SingularApi } from './singular-api';

export interface PluralApi<Html extends Element = Element, Component = any> {
  get<Html extends Element, Component = any>(
    cssSelector: string,
  ): PluralApi<Html, Component>;
  get<Html extends Element, Component>(
    component: Type<Component>,
  ): PluralApi<Html, Component>;
  get<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): PluralApi<Html, Component>;

  getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): PluralApi<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): PluralApi<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): PluralApi<Html, Component>;

  attr(name: string): string[];
  attr<Out>(name: string, convert: ConverterFn<Out>): Out[];
  attr<Out>(name: string, convert?: ConverterFn<Out>): string[] | Out[];

  textContents(trim?: boolean): string[];

  withApi<
    Html extends Element,
    Component,
    Api extends PluralApi<Html, Component> = PluralApi<Html, Component>,
  >(
    apiType: Type<Api>,
  ): PluralApi<Html, Component>;

  forEach(
    handler: (element: SingularApi<Html, Component>, index: number) => any,
  ): void;
  find(
    handler: (element: SingularApi<Html, Component>, index: number) => boolean,
  ): SingularApi<Html, Component>;
  filter(
    handler: (element: SingularApi<Html, Component>, index: number) => boolean,
  ): PluralApi<Html, Component>;
  map<Out>(
    handler: (element: SingularApi<Html, Component>, index: number) => Out,
  ): Out[];
  first(): SingularApi<Html, Component>;
  nth(position: number): SingularApi<Html, Component>;
  atIndex(index: number): SingularApi<Html, Component>;
  last(): SingularApi<Html, Component>;
}
