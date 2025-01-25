import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgtxElement } from '../core';
import { TypedDebugElement } from '../types';
import { isNgtxQuerySelector, queryNgtxMarker } from '../utility';

type TestGeneratorFn<T> = (ctx: {
  scenarioDescription: string;
  fixture: ComponentFixture<T>;
  setupTest: () => void;
}) => void;
type ConfiguratorFn = (testBed: TestBed) => void;

export const useTestBed = async <T>(
  testBed: TestBed,
  componentType: Type<T>,
) => {
  await testBed.compileComponents();
  const fixture = testBed.createComponent(componentType);

  return Object.assign(scenario, { fixture, query });

  function query<Html extends HTMLElement, Component>(query: string) {
    const debugElement: TypedDebugElement<Html, Component> =
      isNgtxQuerySelector(query)
        ? queryNgtxMarker(query as string, this.debugElement)
        : typeof query === 'string'
        ? this.debugElement.query(By.css(query))
        : this.debugElement.query(By.directive(query));

    if (debugElement) {
      return new NgtxElement(debugElement);
    }
  }

  function scenario(description: string, ...configurations: ConfiguratorFn[]) {
    return {
      where: () => {},
      expect,
    };

    function expect(...testGeneratorFns: TestGeneratorFn<T>[]) {
      const setupTest = () =>
        configurations.forEach((config) => config(testBed));
      testGeneratorFns.forEach((generateTest) =>
        generateTest({ scenarioDescription: description, fixture, setupTest }),
      );
    }
  }
};
