import { AsyncPipe } from '@angular/common';
import {
  Component,
  inject,
  Injectable,
  Input,
  input,
  signal,
  SimpleChanges,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TestingModule } from '../../core/testing-modules';
import { containText } from '../../declarative-testing/lib';
import { ngtx } from '../../ngtx';
import {
  withChangeDetectionAfterSetup,
  withHost,
  withProvider,
  withRouteParams,
} from '../../scenario-testing/lib';
import { ScenarioTestingHarness } from '../../scenario-testing/scenario-testing';
import { NgtxScenarioTestingHarnessExtensionFn } from '../../scenario-testing/types';
import { getClassName } from '../../utility/string.utilities';

function haveComponentType(
  type: Type<any>,
): NgtxScenarioTestingHarnessExtensionFn {
  return ({ targetRef, displayName, isAssertionNegated }) => {
    const verb = isAssertionNegated ? 'not be' : 'be';
    const componentType = getClassName(type);

    it(`[${displayName}] should ${verb} of component type "${componentType}"`, () => {
      const targets = targetRef();

      for (const target of targets) {
        if (isAssertionNegated) {
          expect(target.componentInstance).not.toBeInstanceOf(type);
        } else {
          expect(target.componentInstance).toBeInstanceOf(type);
        }
      }
    });
  };
}

@Injectable()
class MyService {
  value = 'Hello, value!';
  subject$ = new BehaviorSubject('Hello, subject!');
  signal = signal('Hello, signal!');
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
  template: `<button [attr.disabled]="disabled">{{ text }}</button>`,
  selector: 'app-button',
})
class ButtonComponent {
  readonly text = input('click me!');
  readonly disabled = input(false);
}

@Component({
  standalone: false,
  template: `
    <div
      class="div-style"
      style="color: red; fontSize: 12px"
      [style.background]="css"
    >
      {{ myService.value }}
    </div>
    <div class="div-style" [style.background]="css"></div>

    <app-text [text]="myService.value" />
    <app-text data-ngtx="textbox" text="1" />
    <app-text data-ngtx="textbox" text="2" />
    <app-text data-ngtx="textbox" text="3" />
    <app-button [disabled]="false" />

    <div id="value">{{ myService.value }}</div>
    <div id="subject">{{ myService.subject$ | async }}</div>
    <div id="signal">{{ myService.signal() }}</div>

    @if (paramId) {
      <div
        data-ngtx="route-param"
        [style.background]="css"
        [attr.title]="paramId"
      >
        {{ paramId }}
      </div>
    }

    <nav>
      <a>A</a>
      <a>B</a>
      <a>C</a>
      <a>D</a>
    </nav>
  `,
})
class ScenarioTestComponent {
  @Input() color = 'green';
  disabled = input(false);

  myService = inject(MyService);
  route = inject(ActivatedRoute);
  paramId?: string;
  css?: string;

  ngOnChanges(changes: SimpleChanges) {
    if ('color' in changes) {
      this.css = this.color;
    }
  }
  ngOnInit() {
    this.paramId = this.route.snapshot.params.id;
  }
}

const MyTestingModule = TestingModule.configure({
  imports: [RouterModule.forRoot([]), AsyncPipe, ButtonComponent],
  declarations: [ScenarioTestComponent, TextComponent],
  providers: [MyService],
});

describe(
  'ScenarioTestComponent',
  ngtx<ScenarioTestComponent>(({ When, host, get, scenario, useFixture }) => {
    beforeEach(() => {
      MyTestingModule.forComponent(ScenarioTestComponent);
      const fixture = TestBed.createComponent(ScenarioTestComponent);
      useFixture(fixture);
    });

    class the {
      static textsFrom1to3 = ScenarioTestingHarness.forAll<
        HTMLElement,
        TextComponent
      >('ngtx_textbox');
      static styledDiv = ScenarioTestingHarness.forAll('.div-style');
      static paramIdDiv = ScenarioTestingHarness.for('ngtx_route-param');
      static text = ScenarioTestingHarness.for(TextComponent, {
        displayName: 'PageTitle',
      });
      static button = ScenarioTestingHarness.for(ButtonComponent);
      static divWithValueTextContent = ScenarioTestingHarness.for('#value');
      static divWithSubjectTextContent = ScenarioTestingHarness.for('#subject');
      static divWithSignalTextContent = ScenarioTestingHarness.for('#signal');

      static links = ScenarioTestingHarness.forAll('a');
    }

    class that {
      static button = () => get(ButtonComponent);
      static text = () => get(TextComponent);
    }

    scenario('links').expect(
      the.links.toBeFound({ times: 4 }),
      the.links.first().toContainText('A'),
      the.links.range(2, 3).toContainText(['B', 'C']),
      the.links.range(2, 4).toContainText(['B', 'C', 'D']),
      the.links
        .where({ name: ':even', filter: (_, i) => (i + 1) % 2 === 0 })
        .toContainText(['B', 'D']),
      the.links.last().toContainText('D'),
    );

    scenario('Jane')
      .setup(
        withProvider(MyService).havingState({
          value: 'Jane',
          signal: 'Jane',
          subject$: new BehaviorSubject('Jane'),
        }),
        withChangeDetectionAfterSetup(),
      )
      .expect(
        the.textsFrom1to3.toHaveState([
          { text: '1' },
          { text: '2' },
          { text: '3' },
        ]),
        the.styledDiv.toBeFound(),
        the.styledDiv.not.toBeMissing(),
        the.text.toHaveState({ text: 'Jane' }),
        the.divWithValueTextContent.toContainText('Jane'),
        the.divWithSubjectTextContent.toContainText('Jane'),
        the.divWithSignalTextContent.toContainText('Jane'),
        the.text.not.toHaveState({ text: 'Henry' }),
        the.button.toBeEnabled(),
        the.button.not.toBeEnabled(false),
        the.text.to(haveComponentType(TextComponent)),
        the.text.not.to(haveComponentType(ButtonComponent)),
        the.paramIdDiv.toBeMissing(),
      );

    scenario('Henry')
      .setup(
        withRouteParams({ id: '42' }),
        withProvider(MyService).havingState({ value: 'Henry' }),
        withHost().havingState({ color: 'blue' }),
        withChangeDetectionAfterSetup(),
      )
      .expect(
        the.styledDiv.toHaveStyle({ background: 'blue' }),
        the.styledDiv.toHaveStyle([
          { background: 'blue' },
          { background: 'blue' },
        ]),
        the.styledDiv.not.toBeMissing(),
        the.text.toHaveState({ text: 'Henry' }),
        the.text.not.toHaveState({ text: 'Jane' }),
        the.button.toBeEnabled(),
        the.button.not.toBeEnabled(false),
        the.text.to(haveComponentType(TextComponent)),
        the.text.not.to(haveComponentType(ButtonComponent)),
        the.paramIdDiv.toBeFound(),
      );

    it('should work', () => {
      When(host).rendered().expect(that.text).not.to(containText('Jane'));
    });
  }),
);
