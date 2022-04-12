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
    let When: EffectApi<EffectTestComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [EffectTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(EffectTestComponent);
      When = createEffectTestingApi(useFixture(fixture), () => jest.fn());
    });

    class Get {
      static Input() {
        return get<HTMLInputElement>('input');
      }
      static Button() {
        return get<HTMLButtonElement>('button');
      }
    }

    it('when -> emitsEvent -> expectHostProperty -> toChangeToValue', () => {
      When(Get.Input)
        .emitsEvent('change', { target: { value: 'some-text' } })
        .expectHostProperty('text')
        .toChangeToValue('some-text');
    });

    it('when -> emitsEvent -> expectHostProperty -> toChangeToEventValue', () => {
      When(Get.Button)
        .emitsEvent('click', 'some text')
        .expectHostProperty('text')
        .toChangeToEventValue();
    });

    it('when -> emitsEvent -> expectHostToEmit', () => {
      When(Get.Button)
        .emitsEvent('click', 'some text')
        .expectHostToEmit('textChange');
    });

    it('when -> emitsEvent -> expectHostToEmit -> fail', () => {
      try {
        When(Get.Button)
          .emitsEvent('unknown-event' as any, 'some text')
          .expectHostToEmit('textChange');

        fail();
      } catch {}
    });

    it('when -> emitsEvent -> expectHostToEmit -> times', () => {
      When(Get.Button)
        .emitsEvent('click', 'some text')
        .expectHostToEmit('textChange')
        .times(1);
    });

    it('when -> emitsEvent -> expectHostToEmit -> times -> fail', () => {
      try {
        When(Get.Button)
          .emitsEvent('click', 'some text')
          .expectHostToEmit('textChange')
          .times(2);

        fail();
      } catch {}
    });

    it('when -> emitsEvent -> expectHostToEmit -> withArgs', () => {
      When(Get.Button)
        .emitsEvent('click', 'some text')
        .expectHostToEmit('textChange')
        .withArgs('some text');
    });

    it('when -> emitsEvent -> expectHostToEmit -> withArgs -> fail', () => {
      try {
        When(Get.Button)
          .emitsEvent('click', 'some text')
          .expectHostToEmit('textChange')
          .withArgs('some other text than before');

        fail();
      } catch {}
    });
  }),
);
