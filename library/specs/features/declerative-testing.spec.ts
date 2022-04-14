import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  callsLifeCycleHooks,
  DeclarativeTestExtension,
  tap,
} from '../../features/declarative-testing';
import { ngtx } from '../../ngtx';

class SomeService {
  someMethod(anyNumber: number) {}
}

@Component({
  template: `
    <input #txt [value]="text" (change)="onChange($event.target.value)" />
    <button (click)="onChange($event); txt.focus()">Click to set text</button>
    <p *ngIf="showText">{{ text }}</p>
  `,
})
class DeclarativeTestComponent {
  @Output() textChange = new EventEmitter<string>();
  public text = '';
  public showText = false;
  public returnValue: any;

  constructor(public readonly token: SomeService) {}

  public onChange(value: string) {
    this.text = value;
    this.textChange.emit(value);
    this.returnValue = this.token.someMethod(42);
  }

  ngOnInit() {}

  ngOnChanges(e: any) {}
}

const fail = () => expect(false).toBe(true);

describe(
  'When',
  ngtx<DeclarativeTestComponent>(({ useFixture, When, host, get }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DeclarativeTestComponent],
        providers: [SomeService],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(DeclarativeTestComponent);
      useFixture(fixture, {
        spyFactory: (returnValue) => jest.fn(() => returnValue),
      });
    });

    class Components {
      static Input() {
        return get<HTMLInputElement, unknown>('input');
      }
      static Button() {
        return get<HTMLButtonElement, unknown>('button');
      }
      static Text() {
        return get('p');
      }
    }

    it('when -> emits -> expect -> toHaveState { "value" }', () => {
      When(Components.Input)
        .emits('change', { target: { value: 'some-text' } })
        .expect(host)
        .toHaveState({ text: 'some-text' });
    });

    it('when -> emits -> expect -> toEmit', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange');
    });

    it('when -> emits -> expect -> toEmit -> fail', () => {
      try {
        When(Components.Button)
          .emits('unknown-event' as any, 'some text')
          .expect(host)
          .toEmit('textChange');

        fail();
      } catch {}
    });

    it('when -> emits -> expect -> toEmit { times }', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { times: 1 });
    });

    it('when -> emits -> expect -> toEmit { times } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click', 'some text')
          .expect(host)
          .toEmit('textChange', { times: 2 });

        fail();
      } catch {}
    });

    it('when -> emits -> expect -> toEmit { args: "value" }', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { args: 'some text' });
    });

    it('when -> emits -> expect -> toEmit { args: "value" } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click', 'some text')
          .expect(host)
          .toEmit('textChange', { args: 'some other text than emitted' });

        fail();
      } catch {}
    });

    it('when -> hasState -> expect -> toHaveAttributes { "value" }', () => {
      When(host)
        .hasState({ text: 'some text' })
        .expect(Components.Input)
        .toHaveAttributes({ value: 'some text' });
    });

    it('when -> hasState -> and -> expect -> toHaveAttributes', () => {
      When(host)
        .hasState({ ngOnInit: jest.fn(), ngOnChanges: jest.fn() })
        .and(
          callsLifeCycleHooks({
            ngOnInit: true,
            ngOnChanges: { test: 42 },
          }),
        )
        .expect(host)
        .toHaveState({});

      expect(host().componentInstance.ngOnInit).toHaveBeenCalledTimes(1);
      expect(host().componentInstance.ngOnInit).toHaveBeenCalledWith();
      expect(host().componentInstance.ngOnChanges).toHaveBeenCalledTimes(1);
      expect(host().componentInstance.ngOnChanges).toHaveBeenCalledWith({
        test: 42,
      });
    });

    it('toBeMissing', () => {
      When(host)
        .hasState({ showText: false })
        .expect(Components.Text)
        .toBeMissing();
    });

    it('toBeMissing -> fail', () => {
      try {
        When(host)
          .hasState({ showText: true })
          .expect(Components.Text)
          .toBeMissing();

        fail();
      } catch {}
    });

    it('toBePresent', () => {
      When(host)
        .hasState({ showText: true })
        .expect(Components.Text)
        .toBePresent();
    });

    it('toBePresent -> fail', () => {
      try {
        When(host)
          .hasState({ showText: false })
          .expect(Components.Text)
          .toBePresent();

        fail();
      } catch {}
    });

    it('toHaveText', () => {
      When(host)
        .hasState({ showText: true, text: 'some text' })
        .expect(Components.Text)
        .toHaveText('some text');
    });

    it('toHaveText -> fail', () => {
      try {
        When(host)
          .hasState({ showText: true, text: 'some text' })
          .expect(Components.Text)
          .toHaveText('some other text');

        fail();
      } catch {}
    });

    it('toContainText', () => {
      When(host)
        .hasState({ showText: true, text: 'some text' })
        .expect(Components.Text)
        .toContainText('some');
    });

    it('toContainText -> fail', () => {
      try {
        When(host)
          .hasState({ showText: true, text: 'some text' })
          .expect(Components.Text)
          .toContainText('other');

        fail();
      } catch {}
    });

    it('rendered', () => {
      When(host).rendered().expect(host).toHaveState({});
    });

    it('extension: tap before', () => {
      When(host)
        .hasState({ text: 'abc' })
        .and(tap(() => expect(host().componentInstance.text).toBe(''), true))
        .expect(host)
        .toBePresent();
    });

    it('extension: tap after', () => {
      When(host)
        .hasState({ text: 'abc' })
        .and(tap(() => expect(host().componentInstance.text).toBe('abc')))
        .expect(host)
        .toBePresent();
    });

    it('toHaveCalled', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(SomeService, 'someMethod');
    });

    it('toHaveCalled -> fail', () => {
      try {
        When(Components.Button)
          .emits('abort')
          .expect(host)
          .toHaveCalled(SomeService, 'someMethod');

        fail();
      } catch {}
    });

    it('toHaveCalled { times }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(SomeService, 'someMethod', { times: 1 });
    });

    it('toHaveCalled { times } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalled(SomeService, 'someMethod', { times: 2 });

        fail();
      } catch {}
    });

    it('toHaveCalled { args }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(SomeService, 'someMethod', { args: 42 });
    });

    it('toHaveCalled { args } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalled(SomeService, 'someMethod', { args: null });

        fail();
      } catch {}
    });

    it('toHaveCalled { whichReturns }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(SomeService, 'someMethod', {
          whichReturns: 'some value',
        });

      expect(host().componentInstance.returnValue).toEqual('some value');
    });

    it('to() extension', () => {
      When(Components.Button)
        .emits('click')
        .expect(Components.Input)
        .to(haveFocus);
    });

    it('to() extension -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(Components.Text)
          .to(haveFocus);

        fail();
      } catch {}
    });
  }),
);

const haveFocus: DeclarativeTestExtension<any, any> = ({
  assertion,
  object,
}) => {
  return {
    assertion: () => {
      assertion?.();
      expect(document.activeElement).toBe(object().nativeElement);
    },
  };
};
