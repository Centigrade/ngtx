import { Component, Injectable, Type, inject, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TestingModule } from '../../core/testing-modules';
import { ngtx } from '../../ngtx';
import { ScenarioTestingHarness } from '../../scenario-testing/scenario-harnesses';
import { useScenarioTesting } from '../../scenario-testing/scenario-testing';

@Injectable()
class MyService {
  value = 'Hello, World!';
}

@Component({
  standalone: false,
  template: `<p>{{ text }}</p>`,
  selector: 'app-text',
})
class TextComponent {
  readonly text = input('unset');
}

@Component({
  standalone: false,
  template: `
    <div class="div-style" style="color: red; fontSize: 12px">
      {{ myService.value }}
    </div>
    <app-text [text]="myService.value" />
    @if(paramId){
    <div data-ngtx="route-param" [attr.title]="paramId">{{ paramId }}</div>
    }
  `,
})
class ScenarioTestComponent {
  myService = inject(MyService);
  route = inject(ActivatedRoute);
  paramId = this.route.snapshot.params.id;
}

// ----------------------------
// Custom Extensions (scenario setup functions)
// ----------------------------

const withRouterParams = (params: Record<string, unknown>) =>
  ngtx.scenario.envSetupFn(() => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { params: params } },
    });
  });

const overrideProvider = <T>(token: Type<T>) => {
  return {
    setState: (state: Partial<T>) =>
      ngtx.scenario.envSetupFn(() => {
        TestBed.overrideProvider(token, { useValue: state });
      }),
  };
};

const beComponentType = (type: any) =>
  // TODO: docs: document that debugElement must only be accessed within it case:
  ngtx.scenario.testGeneratorFn((addTests, harness) =>
    addTests(() => {
      const description = harness.isAssertionNegated
        ? `should not be the component "${type.name}"`
        : `should be the component "${type.name}"`;

      it(description, () => {
        if (harness.isAssertionNegated) {
          expect(harness.debugElement.componentInstance).not.toBeInstanceOf(
            type,
          );
        } else {
          expect(harness.debugElement.componentInstance).toBeInstanceOf(type);
        }
      });
    }),
  );

// ----------------------------
// Usage Example
// ----------------------------

const MyTestingModule = TestingModule.configure({
  imports: [RouterModule.forRoot([])],
  declarations: [ScenarioTestComponent, TextComponent],
  providers: [MyService],
});

const { test, testEnv } = useScenarioTesting({
  forComponent: ScenarioTestComponent,
  createTestBed: () => MyTestingModule.forComponent(ScenarioTestComponent),
});

class the {
  static Div = new ScenarioTestingHarness(testEnv, 'div');
  static Text = new ScenarioTestingHarness(testEnv, TextComponent);
  static ParamIdDiv = new ScenarioTestingHarness(testEnv, 'ngtx_route-param');
  static host = new ScenarioTestingHarness(testEnv);
}

// TODO: does it make sense to create one big it case instead smaller multiple?
test(`MyService value is displayed`)
  .setup(
    withRouterParams({ id: undefined }),
    overrideProvider(MyService).setState({ value: 'Jane' }),
  )
  .expect(
    the.host.toBeFound(),
    the.Div.toContainText('Jane'),
    the.Div.not.toContainText('Madam'),
    the.ParamIdDiv.toBeMissing(),
    the.ParamIdDiv.not.toBeFound(),
    the.Text.toBeFound(),
    the.Text.toHaveState({ text: 'Jane' }),
    the.Div.toHaveStyles({
      color: 'red',
      fontSize: '12px',
    }),
    the.Div.not.toHaveStyles({
      color: 'blue',
      fontSize: '24px',
    }),
  );

test(`The param id is 42`)
  .setup(
    withRouterParams({ id: 42 }),
    overrideProvider(MyService).setState({ value: 'Henry' }),
  )
  .expect(
    the.host.toHaveState({ paramId: 42 }),
    the.Div.toHaveText('heNRY', { trim: true, ignoreCase: true }),
    the.Div.not.toHaveText('Ernie', { trim: true, ignoreCase: true }),
    the.Div.toHaveClass('div-style'),
    the.ParamIdDiv.not.toHaveClass('div-style'),
    the.ParamIdDiv.toBeFound(),
    the.ParamIdDiv.not.toBeMissing(),
    the.ParamIdDiv.toHaveText('42'),
    the.ParamIdDiv.toHaveAttributes({ title: 42 }),
  );

test('Some Control').expect(
  the.Div.toBeFound(),
  the.ParamIdDiv.toBeMissing(),
  the.Text.toHaveState({ text: 'Hello, World!' }),
);

test('Other Control').expect(
  the.Text.to(
    beComponentType(TextComponent),
    beComponentType(TextComponent),
    beComponentType(TextComponent),
  ),
  the.Text.not.to(beComponentType(ScenarioTestComponent)),
);

testEnv.runTests();
