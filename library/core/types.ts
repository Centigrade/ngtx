import type {
  EnvironmentProviders,
  ModuleWithProviders,
  Provider,
  Type,
} from '@angular/core';
import type { TestingModule } from './testing-modules';

export type ITestingModule = {
  /** Either `NgModules` or `TestingModules` are allowed here. */
  imports?: (
    | any[]
    | Type<any>
    | TestingModule
    | ModuleWithProviders<unknown>
  )[];
  /** The testing providers to use for tests. Preferably TestingServices that are noop with the same API as the original. */
  providers?: (Provider | EnvironmentProviders)[];
  /** **Unmocked (!)** declarations. Declarations gets auto-mocked when you call `TestingModule.configure().forComponent(MyComponent)` */
  declarations?: any[];
};

export type ComponentOverride = {
  component: Type<any>;
  providers: Provider[];
};

export type ForComponentOptions = {
  // declarationsToNotMock?: Type<any>[];
  overrideViewChildren?: ComponentOverride[];
  additionalDeclarations?: Type<any>[];
  providers?: Provider[];
  overrideComponentProviders?: Provider[];
};

export type ForServiceOptions = {
  providers?: Provider[];
};

export type TestingModulePlugin = {
  /** Transform components into something custom, e.g. mocking with [ng-mocks](https://ng-mocks.sudo.eu). */
  transformComponents?: (ctx: DeclarationPluginContext) => any;
  /** Transform directives into something custom, e.g. mocking with [ng-mocks](https://ng-mocks.sudo.eu). */
  transformDirectives?: (ctx: DeclarationPluginContext) => any;
  /** Transform pipes into something custom, e.g. mocking with [ng-mocks](https://ng-mocks.sudo.eu). */
  transformPipes?: (ctx: DeclarationPluginContext) => any;
  /** Transform providers into something custom, e.g. mocking with [ng-mocks](https://ng-mocks.sudo.eu). */
  transformProviders?: (ctx: ProviderPluginContext) => any;
};

export type DeclarationPluginContext = {
  declaration: Type<any>;
  isStandalone: boolean;
  objectUnderTest: Type<any>;
};
export type ProviderPluginContext = {
  provider: any;
  objectUnderTest: Type<any>;
};
