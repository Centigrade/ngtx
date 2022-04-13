import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { $event } from '../../features/declarative-testing';
import { ngtx } from '../../ngtx';

@Component({
  template: `
    <input [value]="text" (change)="onChange($event.target.value)" />
    <button (click)="onChange($event)">Click to set text</button>
  `,
})
class DeclarativeTestComponent {
  @Output() textChange = new EventEmitter<string>();
  public text = '';

  public onChange(value: string) {
    this.text = value;
    this.textChange.emit(value);
  }
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
    }

    it('when -> emits -> expect -> toHaveState { "value" }', () => {
      When(Components.Input)
        .emits('change', { target: { value: 'some-text' } })
        .expect(host)
        .toHaveState({ text: 'some-text' });
    });

    it('when -> emits -> expect -> toHaveState { $event }', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .expect(host)
        .toHaveState({ text: () => $event });
    });

    it('when -> emits -> expect -> toHaveState { $event.path }', () => {
      When(Components.Input)
        .emits('change', { target: { value: 'some-text' } })
        .expect(host)
        .toHaveState({ text: () => $event.target.value });
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

    it('when -> emits -> expect -> toEmit { args: $event }', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { args: () => $event });
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
  }),
);
