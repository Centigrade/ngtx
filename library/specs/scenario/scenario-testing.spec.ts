import { Component, inject, Injectable, input, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TestingModule } from '../../core/testing-modules';
import { ngtx } from '../../ngtx';
import {
  withInitialChangeDetection,
  withProvider,
} from '../../scenario-testing/lib';
import { ScenarioTestingHarness } from '../../scenario-testing/scenario-testing';
import { NgtxScenarioTestingHarnessExtensionFn } from '../../scenario-testing/types';
import { getClassName } from '../../utility/string.utilities';
import { ngMocksPlugin } from '../shared/util';

function haveComponentType(
  type: Type<any>,
): NgtxScenarioTestingHarnessExtensionFn {
  return ({ targetRef, displayName, isAssertionNegated }) => {
    const verb = isAssertionNegated ? 'not be' : 'be';
    const componentType = getClassName(type);

    it(`[${displayName}] should ${verb} of component type "${componentType}"`, () => {
      if (isAssertionNegated) {
        expect(targetRef().componentInstance).not.toBeInstanceOf(type);
      } else {
        expect(targetRef().componentInstance).toBeInstanceOf(type);
      }
    });
  };
}

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
    <div class="div-style" style="color: red; fontSize: 12px">
      {{ myService.value }}
    </div>
    <app-text [text]="myService.value" />
    <app-button [disabled]="false" />
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

const MyTestingModule = TestingModule.configure(
  {
    imports: [RouterModule.forRoot([]), ButtonComponent],
    declarations: [ScenarioTestComponent, TextComponent],
    providers: [MyService],
  },
  [ngMocksPlugin],
);

describe(
  'ScenarioTestComponent',
  ngtx.scenarios<ScenarioTestComponent>(({ scenario, useFixture }) => {
    beforeEach(() => {
      MyTestingModule.forComponent(ScenarioTestComponent);
      const fixture = TestBed.createComponent(ScenarioTestComponent);
      useFixture(fixture);
    });

    class the {
      static div = new ScenarioTestingHarness('div');
      static paramIdDiv = new ScenarioTestingHarness('ngtx_route-param');
      static text = new ScenarioTestingHarness(TextComponent, {
        displayName: 'PageTitle',
      });
      static button = new ScenarioTestingHarness(ButtonComponent);
    }

    scenario('admin form')
      .setup(
        withProvider(MyService).havingState({ value: 'Jane' }),
        withInitialChangeDetection(),
      )
      .expect(
        the.div.toBeFound(),
        the.div.not.toBeMissing(),
        the.text.toHaveState({ text: 'Jane' }),
        the.text.not.toHaveState({ text: 'Henry' }),
        the.button.toBeEnabled(),
        the.button.not.toBeEnabled(false),
        the.text.to(haveComponentType(TextComponent)),
        the.text.not.to(haveComponentType(ButtonComponent)),
        the.paramIdDiv.toBeMissing(),
      );
  }),
);
