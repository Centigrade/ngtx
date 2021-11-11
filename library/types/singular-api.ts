import { Type } from '@angular/core';
import { ConverterFn, QueryTarget } from './index';
import type { PluralApi } from './plural-api';

export interface SingularApi<Html extends Element, Component> {
  withApi<
    Html extends Element,
    Component,
    Api extends SingularApi<Html, Component> = SingularApi<Html, Component>,
  >(
    apiType: Type<Api>,
  ): Api;

  get<Html extends Element, Component = any>(
    cssSelector: string,
  ): SingularApi<Html, Component>;
  get<Html extends Element, Component>(
    component: Type<Component>,
  ): SingularApi<Html, Component>;
  get<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): SingularApi<Html, Component>;

  getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): PluralApi<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): PluralApi<Html, Component>;
  getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): PluralApi<Html, Component>;

  attr(name: string): string;
  attr<Out>(name: string, convert: ConverterFn<Out>): Out;
  attr<Out>(name: string, convert?: ConverterFn<Out>): string | Out;

  triggerEvent(name: string, eventArgs?: any): void;
  textContent(trim?: boolean): string;
  debug(): void;
}
