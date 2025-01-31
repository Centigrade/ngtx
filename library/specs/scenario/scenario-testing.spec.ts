import { Component, Injectable, Type, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ElementHarness } from '../../scenario-testing/scenario-harnesses';
import { useScenario } from '../../scenario-testing/scenario-testing';
import {
  ComponentFixtureRef,
  NgtxTestingFrameworkAdapter,
} from '../../scenario-testing/types';

@Injectable()
class MyService {
  value = 'Hello, World!';
}

@Component({
  standalone: false,
  template: `
    <div class="div-style" style="color: red; fontSize: 12px">
      {{ myService.value }}
    </div>
    @if(paramId){
    <div id="route-param">{{ paramId }}</div>
    }
  `,
})
class ScenarioTestComponent {
  myService = inject(MyService);
  route = inject(ActivatedRoute);
  paramId = this.route.snapshot.params.id;
}

// ----------------------------
// Test Setup Utilities
// ----------------------------
const withRouterParams = (params: Record<string, unknown>) => () => {
  TestBed.overrideProvider(ActivatedRoute, {
    useValue: { snapshot: { params: params } },
  });
};

const withServiceState =
  <T>(token: Type<T>, state: Partial<T>) =>
  () => {
    TestBed.overrideProvider(token, { useValue: state });
  };

const withInitialChangeDetection = () => {
  return (fxRef: ComponentFixtureRef) => {
    fxRef().changeDetectorRef.detectChanges();
  };
};

// ----------------------------
// Usage Example
// ----------------------------
const jestFramework: NgtxTestingFrameworkAdapter = {
  describe,
  beforeEach,
};

const { scenario, tests } = useScenario({
  componentType: ScenarioTestComponent,
  testingFrameworkAdapter: jestFramework,
  moduleConfig: {
    declarations: [ScenarioTestComponent],
    providers: [MyService],
  },
});

class the {
  static Div = new ElementHarness('div', tests);
  static ParamIdDiv = new ElementHarness('#route-param', tests);
}

scenario('MyService value is displayed 1')
  .configure(
    withRouterParams({ id: undefined }),
    withServiceState(MyService, { value: 'Jane' }),
  )
  .whenComponentReady(withInitialChangeDetection())
  .expect(
    the.Div.toContainText('Jane'),
    the.ParamIdDiv.toBeMissing(),
    the.Div.toHaveStyles({
      color: 'red',
      fontSize: '12px',
    }),
  );

scenario('The param id is 42')
  .configure(
    withRouterParams({ id: 42 }),
    withServiceState(MyService, { value: 'Henry' }),
  )
  .whenComponentReady(withInitialChangeDetection())
  .expect(
    the.Div.toHaveText('heNRY', { trim: true, ignoreCase: true }),
    the.ParamIdDiv.toBeFound(),
    the.ParamIdDiv.toHaveText('42'),
  );

tests.run();
