import { NgModule, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
