import {
  Injector,
  ModuleWithProviders,
  type EnvironmentProviders,
  type NgModule,
  type Provider,
  type ProviderToken,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockDeclaration } from 'ng-mocks';
import { PublicApi } from '../declarative-testing/types';

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

interface ITestingModule {
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
}

export interface ForComponentOptions {
  declarationsToNotMock?: Type<any>[];
  additionalDeclarations?: Type<any>[];
  providers?: Provider[];
  overrideComponentProviders?: Provider[];
}

export interface ForServiceOptions {
  providers?: Provider[];
}

const TestingModuleSymbol = Symbol('TestingModule');

export class TestingModule implements ITestingModule {
  public readonly [TestingModuleSymbol] = true;

  static configure(configuration: ITestingModule = {}) {
    return new TestingModule(
      flatten(configuration.imports ?? []),
      flatten(configuration.declarations ?? []),
      flatten(configuration.providers ?? []),
    );
  }

  static isTestingModule(module: any): module is TestingModule {
    return module[TestingModuleSymbol] === true;
  }

  private constructor(
    public readonly imports: any[] = [],
    public readonly declarations: any[] = [],
    public readonly providers: any[] = [],
  ) {}

  forComponent(componentType: Type<any>, opts: ForComponentOptions = {}) {
    if (!this.declarations.includes(componentType)) {
      this.declarations.push(componentType);
    }

    const module: ITestingModule = {
      imports: this.imports,
      declarations: this.declarations,
      providers: this.providers,
    };

    const merged = this.imports
      .filter((item): item is TestingModule =>
        TestingModule.isTestingModule(item),
      )
      .reduce((completeTestingModule, testingModule) => {
        return mergeRecursively(completeTestingModule, testingModule);
      }, module);

    merged.providers = swapMockWithOriginalProvider(
      opts.providers ?? [],
      merged.providers,
    );
    const swappedToOriginalDeclarations =
      merged.declarations?.map(
        swapMockWithOriginalDeclaration(
          componentType,
          opts.declarationsToNotMock,
        ),
      ) ?? [];

    const additionalDeclarations = opts.additionalDeclarations ?? [];
    merged.declarations = [
      ...swappedToOriginalDeclarations,
      ...additionalDeclarations,
    ];

    let testModule = TestBed.configureTestingModule(merged);

    return opts.overrideComponentProviders
      ? testModule.overrideComponent(componentType, {
          set: { providers: [opts.overrideComponentProviders] },
        })
      : testModule;
  }

  forService<T>(serviceType: Type<T>, opts: ForServiceOptions = {}): T {
    const providers = [serviceType, ...(opts.providers ?? [])];
    this.build({ ...opts, providers });

    return TestBed.inject(serviceType);
  }

  build(opts?: ForServiceOptions) {
    const module: ITestingModule = {
      imports: this.imports,
      declarations: [], // no need for declarations in service tests

      // add real service as last entry, that wins over all previous ones:
      providers: flatten([this.providers, opts?.providers ?? []]),
    };

    const merged = this.imports
      .filter((item): item is TestingModule =>
        TestingModule.isTestingModule(item),
      )
      .reduce((completeTestingModule, testingModule) => {
        return mergeRecursively(completeTestingModule, testingModule, false);
      }, module);

    merged.providers = swapMockWithOriginalProvider(
      opts?.providers ?? [],
      merged.providers ?? [],
    );

    TestBed.configureTestingModule(merged);
    return TestBed.inject(Injector);
  }
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

function swapMockWithOriginalDeclaration(
  testedComponentType: Type<any>,
  keptDeclarations: Type<any>[] = [],
) {
  return (item: any) => {
    if (item == testedComponentType) {
      return testedComponentType;
    }
    if (keptDeclarations.includes(item)) {
      return item;
    }

    return MockDeclaration(item);
  };
}

function not(fn: (...args: any[]) => boolean) {
  return (...args: any[]) => !fn(...args);
}

function flatten(arr: any[]): any[] {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten,
    );
  }, []);
}
