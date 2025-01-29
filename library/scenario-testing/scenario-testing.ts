import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgtxElement } from '../core';
import { TypedDebugElement } from '../types';
import { isNgtxQuerySelector, queryNgtxMarker } from '../utility';

export type TestGeneratorFn<T> = (ctx: {
  scenarioDescription: string;
  fixture: ComponentFixture<T>;
  setupTest: () => void;
}) => void | Promise<void>;
export type TestConfiguratorFn = (testBed: TestBed) => void | Promise<void>;

type OmitPromise<T> = T extends Promise<infer U> ? U : T;
export type TestScenario<T> = OmitPromise<ReturnType<typeof useTestBed<T>>>;

export const useTestBed = async <T>(
  testBed: TestBed,
  componentType: Type<T>,
) => {
  let fixture: ComponentFixture<T>;

  await testBed.compileComponents();
  fixture = testBed.createComponent(componentType);

  return Object.assign(scenario, { query });

  function query<Html extends HTMLElement, Component>(
    query: string,
    from: TypedDebugElement<Html, Component> = fixture.debugElement,
  ) {
    const debugElement = isNgtxQuerySelector(query)
      ? queryNgtxMarker(query as string, this.debugElement)
      : typeof query === 'string'
      ? from.query(By.css(query))
      : from.query(By.directive(query));

    if (debugElement) {
      return new NgtxElement(debugElement);
    }
  }

  function scenario(
    description: string,
    ...configurations: TestConfiguratorFn[]
  ) {
    return {
      where: () => {},
      expect,
    };

    async function expect(...testGeneratorFns: TestGeneratorFn<T>[]) {
      const setupTest = async () => {
        for (const config of configurations) {
          await config(testBed);
        }
      };

      for (const generateTest of testGeneratorFns) {
        await generateTest({
          scenarioDescription: description,
          fixture,
          setupTest,
        });
      }
    }
  }
};
