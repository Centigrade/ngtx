import { Component, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgtxElement } from '../../core';
import {
  TestGeneratorFn,
  TestScenario,
  useTestBed,
} from '../../scenario-testing/scenario-testing';
import { TestingModule } from '../../scenario-testing/testing-modules';

@Injectable()
class MyService {
  value = 'Hello, World!';
}

@Component({
  standalone: false,
  template: ` <div>{{ myService.value }}</div> `,
})
class ScenarioTestComponent {
  myService = inject(MyService);
}

const ScenarioTestModule = TestingModule.configure({
  declarations: [ScenarioTestComponent],
  providers: [MyService],
});

class ElementHarness<T> {
  constructor(
    private readonly name: string,
    private readonly target: () => NgtxElement<HTMLElement, T> | undefined,
  ) {}

  toBeFound(): TestGeneratorFn<T> {
    return ({ scenarioDescription, setupTest, fixture }) => {
      it(`[${scenarioDescription}] should find the ${this.name}`, () => {
        setupTest();
        expect(this.target()).toBeTruthy();
      });
    };
  }

  toHaveText(expected: string): TestGeneratorFn<T> {
    return ({ scenarioDescription, setupTest, fixture }) => {
      it(`[${scenarioDescription}] should have the text "${expected}"`, () => {
        setupTest();
        expect(this.target()?.nativeElement.textContent).toContain(expected);
      });
    };
  }
}

const serviceHasValue = (value: string) => (testBed: TestBed) => {
  const myService = testBed.inject(MyService);
  myService.value = value;
};

describe('Scenario Testing', () => {
  let scenario!: TestScenario<ScenarioTestComponent>;

  beforeEach(async () => {
    scenario = await useTestBed(
      ScenarioTestModule.forComponent(ScenarioTestComponent),
      ScenarioTestComponent,
    );
  });

  class the {
    static Div() {
      return new ElementHarness('', () => scenario.query('div'));
    }
  }

  scenario(
    'should display the value from the service',
    serviceHasValue('Hello, Test!'),
  ).expect(
    //
    the.Div().toHaveText('Hello, Test!'),
    the.Div().toBeFound(),
  );
});
