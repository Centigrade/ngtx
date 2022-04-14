import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { callsLifeCycleHooks } from '../../features/declarative-testing';
import { ngtx } from '../../ngtx';

@Component({
  template: `
    <input [value]="text" (change)="onChange($event.target.value)" />
    <button (click)="onChange($event)">Click to set text</button>
    <button (click)="number = number + 1">Increase number</button>
  `,
})
class DeclarativeTestComponent {
  @Output() textChange = new EventEmitter<string>();
  public text = '';
  public number = 1;

  public onChange(value: string) {
    this.text = value;
    this.textChange.emit(value);
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
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(DeclarativeTestComponent);
      useFixture(fixture, { spyFactory: () => jest.fn() });
    });

    class Components {
      static Input() {
        return get<HTMLInputElement>('input');
      }
      static Button() {
        return get<HTMLButtonElement>('button');
      }
      static IncreaseButton() {
        return get<HTMLButtonElement>('button:nth-of-type(2)');
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

    it('alongWith', () => {
      When(host)
        .hasState({ number: 10 })
        .alongWith(Components.IncreaseButton)
        .emits('click')
        .expect(host)
        .toHaveState({ number: 11 });
    });

    it('alongWith -> fail', () => {
      try {
        When(host)
          .hasState({ number: 10 })
          .alongWith(Components.IncreaseButton)
          .emits('click')
          .expect(host)
          .toHaveState({ number: 10 });

        fail();
      } catch {}
    });
  }),
);
