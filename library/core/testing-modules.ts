import {
  isStandalone,
  type NgModule,
  type Provider,
  type ProviderToken,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PublicApi } from '../declarative-testing/types';
import { TestingModuleSymbol } from './symbols';
import {
  DeclarationPluginContext,
  ForComponentOptions,
  ForServiceOptions,
  ITestingModule,
  TestingModulePlugin,
} from './types';

/**
 * Returns a bundle of providers that registers a token and uses a testing class as substituent.
 * The provider bundle configures the dependency injection in a way, that one can ask it for both,
 * the token and the substituent, while receiving always the very same instance, no matter for what
 * token/substituent you ask.
 *
 * **Example:**
 * ~~~ts
 * TestBed.configureTestingModule({
 *  providers: [
 *    ...provideForTesting(MyService, MyMockService),
 *  ]
 * });
 *
 * const real = TestBed.inject(MyService);
 * const mock = TestBed.inject(MyMockService);
 * console.log(real === mock); // => true, it is the same instance!
 * real.onlyRealServiceApiIntellisense();
 * mock.alsoMockServiceApiIntellisense();
 * ~~~
 *
 * @param token
 * @param substituent
 * @returns
 */
export function provideForTesting<T>(
  token: ProviderToken<T>,
  substituent: ProviderToken<PublicApi<T>>,
  asFactory?: boolean | { deps: ProviderToken<unknown>[] },
) {
  if (asFactory != null && asFactory !== false) {
    return [
      {
        provide: token,
        useFactory: (...deps: any[]) => new (substituent as any)(...deps),
        deps: typeof asFactory === 'object' ? asFactory.deps : [],
      },
      { provide: substituent, useExisting: token },
    ] as Provider[];
  }

  return [
    { provide: token, useClass: substituent },
    { provide: substituent, useExisting: token },
  ] as Provider[];
}

export class TestingModule implements ITestingModule {
  public readonly [TestingModuleSymbol] = true;

  static configure(
    configuration: ITestingModule = {},
    plugins: TestingModulePlugin[] | TestingModulePlugin[][] = [],
  ) {
    return new TestingModule(
      flatten(configuration.imports ?? []),
      flatten(configuration.declarations ?? []),
      flatten(configuration.providers ?? []),
      flatten(plugins),
    );
  }

  static isTestingModule(module: any): module is TestingModule {
    return module[TestingModuleSymbol] === true;
  }

  private constructor(
    public readonly imports: any[] = [],
    public readonly declarations: any[] = [],
    public readonly providers: any[] = [],
    public readonly plugins: TestingModulePlugin[] = [],
  ) {}

  forComponent(componentType: Type<any>, opts: ForComponentOptions = {}) {
    const module: ITestingModule = {
      imports: this.imports,
      declarations: this.declarations,
      providers: this.providers,
    };

    const flattenedTestingModule = this.imports
      .filter((item): item is TestingModule =>
        TestingModule.isTestingModule(item),
      )
      .reduce(
        (completeTestingModule, testingModule) =>
          mergeRecursively(completeTestingModule, testingModule),
        module,
      );

    flattenedTestingModule.providers = swapMockWithOriginalProvider(
      opts.providers ?? [],
      flattenedTestingModule.providers,
    );

    const additionalDeclarations = opts.additionalDeclarations ?? [];
    flattenedTestingModule.declarations = [
      ...flattenedTestingModule.declarations!,
      ...additionalDeclarations,
    ];

    // run plugins:
    flattenedTestingModule.imports = flattenedTestingModule.imports!.map(
      (declarationOrModule) => {
        if (isNgModule(declarationOrModule)) {
          return declarationOrModule;
        }
        if (isComponent(declarationOrModule)) {
          return this.applyPluginsToComponent({
            objectUnderTest: componentType,
            declaration: declarationOrModule,
            isStandalone: true,
          });
        }
        if (isDirective(declarationOrModule)) {
          return this.applyPluginsToDirective({
            objectUnderTest: componentType,
            declaration: declarationOrModule,
            isStandalone: true,
          });
        }
        if (isPipe(declarationOrModule)) {
          return this.applyPluginsToPipe({
            objectUnderTest: componentType,
            declaration: declarationOrModule,
            isStandalone: true,
          });
        }

        return declarationOrModule;
      },
    );
    flattenedTestingModule.declarations =
      flattenedTestingModule.declarations!.map((declaration) => {
        if (isComponent(declaration)) {
          return this.applyPluginsToComponent({
            objectUnderTest: componentType,
            declaration: declaration,
            isStandalone: false,
          });
        }
        if (isDirective(declaration)) {
          return this.applyPluginsToDirective({
            objectUnderTest: componentType,
            declaration: declaration,
            isStandalone: false,
          });
        }
        if (isPipe(declaration)) {
          return this.applyPluginsToPipe({
            objectUnderTest: componentType,
            declaration: declaration,
            isStandalone: false,
          });
        }

        return declaration;
      });

    flattenedTestingModule.providers = flattenedTestingModule.providers?.map(
      (provider) =>
        this.plugins.reduce(
          (provider, plugin) =>
            plugin.transformProviders?.({
              provider,
              objectUnderTest: componentType,
            }),
          provider,
        ),
    );

    let testBed = TestBed.configureTestingModule(flattenedTestingModule);

    if (opts.overrideComponentProviders) {
      testBed = testBed.overrideComponent(componentType, {
        set: { providers: [opts.overrideComponentProviders] },
      });
    }
    if (opts.overrideViewChildren) {
      opts.overrideViewChildren.forEach((overriddenComponent) => {
        testBed = testBed.overrideComponent(overriddenComponent.component, {
          set: { providers: [overriddenComponent.providers] },
        });
      });
    }

    return testBed;
  }

  forService<T>(serviceType: Type<T>, opts: ForServiceOptions = {}): T {
    const providers = [serviceType, ...(opts.providers ?? [])];

    const module: ITestingModule = {
      imports: this.imports,
      declarations: [], // no need for declarations in service tests

      // add real service as last entry, that wins over all previous ones:
      providers: flatten([this.providers, providers ?? []]),
    };

    const flattenedTestingModule = this.imports
      .filter((item): item is TestingModule =>
        TestingModule.isTestingModule(item),
      )
      .reduce((completeTestingModule, testingModule) => {
        return mergeRecursively(completeTestingModule, testingModule, false);
      }, module);

    flattenedTestingModule.providers = swapMockWithOriginalProvider(
      providers ?? [],
      flattenedTestingModule.providers ?? [],
    );

    // run plugins
    flattenedTestingModule.providers = flattenedTestingModule.providers?.map(
      (provider) =>
        this.plugins.reduce(
          (provider, plugin) =>
            plugin.transformProviders?.({
              provider,
              objectUnderTest: serviceType,
            }),
          provider,
        ),
    );

    TestBed.configureTestingModule(flattenedTestingModule);

    return TestBed.inject(serviceType);
  }

  private applyPluginsToComponent(ctx: DeclarationPluginContext): any {
    return this.plugins.reduce(
      (component, plugin) =>
        plugin.transformComponents?.({ ...ctx, declaration: component }),
      ctx.declaration,
    );
  }
  private applyPluginsToDirective(ctx: DeclarationPluginContext): any {
    return this.plugins.reduce(
      (directive, plugin) =>
        plugin.transformDirectives?.({ ...ctx, declaration: directive }),
      ctx.declaration,
    );
  }
  private applyPluginsToPipe(ctx: DeclarationPluginContext): any {
    return this.plugins.reduce(
      (pipe, plugin) => plugin.transformPipes?.({ ...ctx, declaration: pipe }),
      ctx.declaration,
    );
  }
}

// ------------------------------------
// module internals
// ------------------------------------
function isStandaloneDeclaration(value: any): value is Type<any> {
  if (!value || Array.isArray(value)) return false;
  return isStandalone(value);
}
function isComponent(value: any): value is Type<any> {
  if (!value || Array.isArray(value)) return false;
  return value?.ɵcmp != undefined;
}
function isDirective(value: any): value is Type<any> {
  return value?.ɵdir != undefined && value?.ɵcmp == undefined;
}
function isPipe(value: any): value is Type<any> {
  return value?.ɵpipe != undefined;
}
function isNgModule(value: any): value is Type<any> {
  return (
    // hint: usual modules
    value?.ɵmod != undefined ||
    // hint: forRoot() | forChild() patterns
    ('ngModule' in value && value?.ngModule.ɵmod != undefined)
  );
}

function flatten<T>(array: (T | T[])[]): T[] {
  return array.flat(Infinity) as T[];
}

function swapMockWithOriginalProvider(
  originals: Provider[],
  providers: NgModule['providers'],
) {
  const providersWithoutMocks = providers?.filter((provider): any => {
    if ('provide' in provider) {
      return !originals.includes(provider.provide);
    }
    if (originals.includes(provider as any)) {
      return false;
    }

    return true;
  });

  return providersWithoutMocks?.concat(...originals);
}

function mergeRecursively<T extends ITestingModule, I extends ITestingModule>(
  baseModule: T,
  otherModule: I,
  includeDeclarations = true,
): T {
  const ngImports =
    otherModule.imports?.filter(not(TestingModule.isTestingModule)) ?? [];
  const testImports =
    otherModule.imports?.filter(TestingModule.isTestingModule) ?? [];
  const otherModuleWithoutImports: ITestingModule = {
    declarations: includeDeclarations ? otherModule.declarations : [],
    providers: otherModule.providers,
  };

  const moduleWithoutImports = mergeModules(
    baseModule,
    otherModuleWithoutImports,
  );
  const moduleWithNgImports = mergeModules(moduleWithoutImports, {
    imports: ngImports,
  });
  const modulesWithTestImports = testImports.map((module) =>
    mergeRecursively(baseModule, module),
  );

  const merged: ITestingModule = mergeModules(moduleWithNgImports, {
    imports: flatten(modulesWithTestImports.map((m) => m.imports ?? [])),
    declarations: flatten(
      modulesWithTestImports.map((m) => m.declarations ?? []),
    ),
    providers: flatten(modulesWithTestImports.map((m) => m.providers ?? [])),
  });

  return merged as T;
}

function mergeModules<A extends ITestingModule, B extends ITestingModule>(
  moduleA: A,
  moduleB: B,
): A {
  const importsA = moduleA?.imports ?? [];
  const importsB = moduleB?.imports ?? [];
  const declarationsA = moduleA?.declarations ?? [];
  const declarationsB = moduleB?.declarations ?? [];
  const providersA = moduleA?.providers ?? [];
  const providersB = moduleB?.providers ?? [];

  const merged = {
    imports: flatten(
      importsA
        .concat(...importsB)
        .filter(ngModulesOnly)
        .filter(uniqueOnly),
    ),
    declarations: flatten(
      declarationsA.concat(...declarationsB).filter(uniqueOnly),
    ),
    providers: flatten(providersA.concat(...providersB).filter(uniqueOnly)),
  };

  return merged as A;
}

function ngModulesOnly(item: any) {
  return !TestingModule.isTestingModule(item);
}
function uniqueOnly<T>(item: T, index: number, array: T[]) {
  return array.indexOf(item) === index;
}
function not(fn: (...args: any[]) => boolean) {
  return (...args: any[]) => !fn(...args);
}
