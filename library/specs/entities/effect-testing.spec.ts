import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { $event } from '../../entities/effect-testing';
import { ngtx } from '../../ngtx';

@Component({
  template: `
    <input [value]="text" (change)="onChange($event.target.value)" />
    <button (click)="onChange($event)">Click to set text</button>
  `,
})
class EffectTestComponent {
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
  ngtx<EffectTestComponent>(({ useFixture, When, host, get }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [EffectTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(EffectTestComponent);
      useFixture(fixture, { spyFactory: () => jest.fn() });
    });

    class Get {
      static Input() {
        return get<HTMLInputElement>('input');
      }
      static Button() {
        return get<HTMLButtonElement>('button');
      }
    }

    it('when -> emits -> expect -> toHaveState { "value" }', () => {
      When(Get.Input)
        .emits('change', { target: { value: 'some-text' } })
        .expect(host)
        .toHaveState({ text: 'some-text' });
    });

    it('when -> emits -> expect -> toHaveState { $event }', () => {
      When(Get.Button)
        .emits('click', 'some text')
        .expect(host)
        .toHaveState({ text: () => $event });
    });

    it('when -> emits -> expect -> toEmit', () => {
      When(Get.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange');
    });

    it('when -> emits -> expect -> toEmit -> fail', () => {
      try {
        When(Get.Button)
          .emits('unknown-event' as any, 'some text')
          .expect(host)
          .toEmit('textChange');

        fail();
      } catch {}
    });

    it('when -> emits -> expect -> toEmit { times }', () => {
      When(Get.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { times: 1 });
    });

    it('when -> emits -> expect -> toEmit { times } -> fail', () => {
      try {
        When(Get.Button)
          .emits('click', 'some text')
          .expect(host)
          .toEmit('textChange', { times: 2 });

        fail();
      } catch {}
    });

    it('when -> emits -> expect -> toEmit { args: "value" }', () => {
      When(Get.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { args: 'some text' });
    });

    it('when -> emits -> expect -> toEmit { args: $event }', () => {
      When(Get.Button)
        .emits('click', 'some text')
        .expect(host)
        .toEmit('textChange', { args: () => $event });
    });

    it('when -> emits -> expect -> toEmit { args: "value" } -> fail', () => {
      try {
        When(Get.Button)
          .emits('click', 'some text')
          .expect(host)
          .toEmit('textChange', { args: 'some other text than emitted' });

        fail();
      } catch {}
    });
  }),
);
