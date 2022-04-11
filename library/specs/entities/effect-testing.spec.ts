import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectApi } from '../../entities/effect-testing';
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
  ngtx(({ useFixture, createEffectTestingApi, get }) => {
    let When: EffectApi;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [EffectTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(EffectTestComponent);
      useFixture(fixture);
      When = createEffectTestingApi(() => jest.fn());
    });

    class Get {
      static Input() {
        return get('input');
      }
      static Button() {
        return get('button');
      }
    }

    it('when -> triggersEvent -> expectHostProperty -> toChangeToValue', () => {
      When(Get.Input)
        .triggersEvent('change', { target: { value: 'some-text' } })
        .expectHostProperty('text')
        .toChangeToValue('some-text');
    });

    it('when -> triggersEvent -> expectHostProperty -> toChangeToEventValue', () => {
      When(Get.Button)
        .triggersEvent('click', 'some text')
        .expectHostProperty('text')
        .toChangeToEventValue();
    });

    it('when -> triggersEvent -> expectHostToEmit', () => {
      When(Get.Button)
        .triggersEvent('click', 'some text')
        .expectHostToEmit('textChange');
    });

    it('when -> triggersEvent -> expectHostToEmit -> fail', () => {
      try {
        When(Get.Button)
          .triggersEvent('unknown-event', 'some text')
          .expectHostToEmit('textChange');

        fail();
      } catch {}
    });

    it('when -> triggersEvent -> expectHostToEmit -> times', () => {
      When(Get.Button)
        .triggersEvent('click', 'some text')
        .expectHostToEmit('textChange')
        .times(1);
    });

    it('when -> triggersEvent -> expectHostToEmit -> times -> fail', () => {
      try {
        When(Get.Button)
          .triggersEvent('click', 'some text')
          .expectHostToEmit('textChange')
          .times(2);

        fail();
      } catch {}
    });

    it('when -> triggersEvent -> expectHostToEmit -> withArgs', () => {
      When(Get.Button)
        .triggersEvent('click', 'some text')
        .expectHostToEmit('textChange')
        .withArgs('some text');
    });

    it('when -> triggersEvent -> expectHostToEmit -> withArgs -> fail', () => {
      try {
        When(Get.Button)
          .triggersEvent('click', 'some text')
          .expectHostToEmit('textChange')
          .withArgs('some other text than before');

        fail();
      } catch {}
    });
  }),
);
