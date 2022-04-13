import { Component, EventEmitter, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { $event, EffectTestingApi } from '../../entities/effect-testing';
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
    let When: EffectTestingApi<EffectTestComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [EffectTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(EffectTestComponent);
      const ngtxFixture = useFixture(fixture);
      When = createEffectTestingApi(ngtxFixture, () => jest.fn());
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
        .emits('change', { target: { value: 'some-text' } })
        .expect('host')
        .toHaveState({ text: () => $event().target.value });
    });

    //   it('when -> emitsEvent -> expectHostProperty -> toChangeToEventValue', () => {
    //     When(Get.Button)
    //       .emits('click', 'some text')
    //       .expectHostProperty('text')
    //       .toChangeToEventValue();
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit', () => {
    //     When(Get.Button)
    //       .emits('click', 'some text')
    //       .expectHostToEmit('textChange');
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit -> fail', () => {
    //     try {
    //       When(Get.Button)
    //         .emits('unknown-event' as any, 'some text')
    //         .expectHostToEmit('textChange');

    //       fail();
    //     } catch {}
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit -> times', () => {
    //     When(Get.Button)
    //       .emits('click', 'some text')
    //       .expectHostToEmit('textChange')
    //       .times(1);
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit -> times -> fail', () => {
    //     try {
    //       When(Get.Button)
    //         .emits('click', 'some text')
    //         .expectHostToEmit('textChange')
    //         .times(2);

    //       fail();
    //     } catch {}
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit -> withArgs', () => {
    //     When(Get.Button)
    //       .emits('click', 'some text')
    //       .expectHostToEmit('textChange')
    //       .withArgs('some text');
    //   });

    //   it('when -> emitsEvent -> expectHostToEmit -> withArgs -> fail', () => {
    //     try {
    //       When(Get.Button)
    //         .emits('click', 'some text')
    //         .expectHostToEmit('textChange')
    //         .withArgs('some other text than before');

    //       fail();
    //     } catch {}
    //   });
  }),
);
