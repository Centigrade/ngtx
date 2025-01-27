import { Component, Injectable, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgtxElement } from '../../core';
import { useTestBed } from '../../scenario-testing/scenario-testing';
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
    private readonly target: () => NgtxElement<HTMLElement, T> | undefined,
  ) {}

  toBeFound() {
    return ({ scenarioDescription, setupTest, fixture }) => {
      it(`[${scenarioDescription}] should find the ${this.target.name}`, () => {
        setupTest();
        expect(this.target()).toBeTruthy();
      });
    };
  }
}

describe('Scenario Testing', async () => {
  const scenario = await useTestBed(
    ScenarioTestModule.forComponent(ScenarioTestComponent),
    ScenarioTestComponent,
  );

  class the {
    static Div() {
      return new ElementHarness(() => scenario.query('div'));
    }
  }

  scenario(
    'should display the value from the service',
    serviceHasValue('Hello, Test!'),
  ).expect(the.Div().toBeFound());
});

const serviceHasValue = (value: string) => (testBed: TestBed) => {
  const myService = testBed.inject(MyService);
  myService.value = value;
};

const toHaveValueHelloTest = (
  fixture: ComponentFixture<any>,
  setupTest: () => void,
) => {
  it(`should have the value 'Hello, Test!'`, () => {
    setupTest();

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Hello, Test!');
  });
};
