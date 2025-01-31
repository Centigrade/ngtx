import { ComponentFixture } from '@angular/core/testing';
import { NgtxTestScenario } from './scenario-testing';

export type ComponentFixtureRef<T = any> = () => ComponentFixture<T>;
export type ScenarioTestDefinition<T> = (
  fixtureRef: ComponentFixtureRef<T>,
) => void;
export type NgtxTestingFrameworkAdapter = {
  describe: (title: string, suite: () => void) => void;
  beforeEach: (fn: () => void) => void;
};

export type NgtxScenarioInitProps<T> = Pick<
  NgtxTestScenario<T>,
  'componentType' | 'moduleConfig' | 'testingFrameworkAdapter'
>;
export type NgtxScenarioProps<T> = NgtxScenarioInitProps<T> &
  Pick<NgtxTestScenario<T>, 'description'> &
  Partial<
    Pick<
      NgtxTestScenario<T>,
      | 'tests'
      | 'testingFrameworkAdapter'
      | 'modificationsAfterComponentCreation'
      | 'modificationsBeforeComponentCreation'
    >
  >;
