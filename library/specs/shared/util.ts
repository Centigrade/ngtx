import { NgModule, Type } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

export function configureTestModule(
  component: Type<any>,
  useFixture: Function,
  module?: NgModule,
): void {
  beforeEach(
    waitForAsync(() => {
      const definedModule = module ?? {};
      const definedDeclarations = definedModule.declarations ?? [];

      TestBed.configureTestingModule({
        ...definedModule,
        declarations: [...definedDeclarations, component],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    const fixture = TestBed.createComponent(component);
    useFixture(fixture);
  });
}
