import { NgModule, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockDeclaration, MockProvider } from 'ng-mocks';
import { TestingModulePlugin } from '../../core/types';

export function configureTestModule(
  component: Type<any>,
  useFixture: Function,
  module?: NgModule,
): void {
  beforeEach(async () => {
    const definedModule = module ?? {};
    const definedDeclarations = definedModule.declarations ?? [];

    await TestBed.configureTestingModule({
      ...definedModule,
      declarations: [...definedDeclarations, component],
    }).compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(component);
    useFixture(fixture);
  });
}

export const ngMocksPlugin: TestingModulePlugin = {
  transformComponents({ declaration, objectUnderTest }) {
    // hint: we don't want to mock the component under test:
    return declaration === objectUnderTest
      ? declaration
      : MockDeclaration(declaration);
  },
  transformPipes({ declaration }) {
    return MockDeclaration(declaration);
  },
  transformDirectives({ declaration }) {
    return MockDeclaration(declaration);
  },
  transformProviders({ provider, objectUnderTest }) {
    return provider === objectUnderTest ? provider : MockProvider(provider);
  },
};
