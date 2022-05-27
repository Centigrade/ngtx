import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import {
  callsLifeCycleHooks,
  componentMethod,
  elementMethod,
  injected,
  provider,
  then,
  waitFakeAsync,
} from '../../features/declarative-testing';
import { DeclarativeTestExtension, PartRef } from '../../features/types';
import { ngtx } from '../../ngtx';

class SomeService {
  id = 0;
  someMethod(anyNumber: number) {}
}

@Component({
  selector: 'app-item',
  template: `<span data-ngtx="item:text">Item {{ text }}</span>`,
})
class ItemComponent {
  @Input() text?: string;
}

@Component({
  template: `
    <div [class.text-shown]="showText">
      <input #txt [value]="text" (change)="onChange($event.target.value)" />
      <button (click)="onChange($event); txt.focus()">Click to set text</button>
      <p *ngIf="showText">{{ text }}</p>

      <app-item
        *ngFor="let item of items; let i = index"
        data-ngtx="item"
        class="item"
        [text]="item"
        [attr.data-index]="i"
        [class.index]="i % 2 == 0"
      >
      </app-item>
    </div>
  `,
})
class DeclarativeTestComponent {
  @Output() textChange = new EventEmitter<string>();
  public text = '';
  public showText = false;
  public returnValue: any;
  public items = [1, 2, 3, 4];

  constructor(public readonly token: SomeService) {}

  public onChange(value: string) {
    this.text = value;
    this.textChange.emit(value);
    this.returnValue = this.token.someMethod(42);
  }

  public methodThatThrows(): void {
    throw new Error('oh no!');
  }

  ngOnInit() {}

  ngOnChanges(e: any) {}

  asyncOperation() {
    requestAnimationFrame(() => {
      this.token.someMethod(42);
    });
  }
}

const fail = () => expect(false).toBe(true);

describe(
  'When',
  ngtx<DeclarativeTestComponent>(({ useFixture, When, host, get, getAll }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DeclarativeTestComponent, ItemComponent],
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
      static Container() {
        return get('div');
      }
      static Items() {
        return getAll<HTMLElement, ItemComponent>('ngtx_item');
      }
      static NotExistingItems() {
        return getAll<HTMLElement, ItemComponent>('not existing');
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

    it('toEmit -> deactivate times explicitly', () => {
      When(Components.Button)
        .emits('click', 'some text')
        .and(then(Components.Button).emits('click'))
        .expect(host)
        .toEmit('textChange', { times: null });
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
        .toEmit('textChange', { args: ['some text'] });
    });

    it('when -> emits -> expect -> toEmit { args: "value" } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click', 'some text')
          .expect(host)
          .toEmit('textChange', { args: ['some other text than emitted'] });

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

    it('hasAttributes', () => {
      When(Components.Button)
        .hasAttributes({ disabled: true })
        .expect(Components.Button)
        .toHaveAttributes({ disabled: true });
    });

    it('hasAttributes -> fail', () => {
      try {
        When(Components.Button)
          .hasAttributes({ disabled: true })
          .expect(Components.Button)
          .toHaveAttributes({ disabled: false });

        fail();
      } catch {}
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

    it('toHaveClass', () => {
      When(host)
        .hasState({ showText: true })
        .expect(Components.Container)
        .toHaveCssClass('text-shown');
    });

    it('toHaveCalled', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod', {
          times: 1,
          args: undefined,
          whichReturns: 7911,
        });

      expect(host().componentInstance.returnValue).toBe(7911);
    });

    it('toHaveCalled -> fail', () => {
      try {
        When(Components.Button)
          .emits('abort')
          .expect(host)
          .toHaveCalled(injected(SomeService), 'someMethod');

        fail();
      } catch {}
    });

    it('toHaveCalled { times }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod', { times: 1 });
    });

    it('toHaveCalled { times } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalled(injected(SomeService), 'someMethod', { times: 2 });

        fail();
      } catch {}
    });

    it('toHaveCalled { args }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod', { args: [42] });
    });

    it('toHaveCalled { args } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalled(injected(SomeService), 'someMethod', { args: [null] });

        fail();
      } catch {}
    });

    it('toHaveCalled { whichReturns }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod', {
          whichReturns: 'some value',
        });

      expect(host().componentInstance.returnValue).toEqual('some value');
    });

    it('toHaveCalled: componentMethod', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalled(componentMethod, 'onChange', { times: 1 });
    });

    it('toHaveCalled: elementMethod', () => {
      When(Components.Button)
        .emits('click')
        .expect(Components.Input)
        .toHaveCalled(elementMethod, 'focus', { times: 1 });
    });

    it('to() extension', () => {
      When(Components.Button)
        .emits('click')
        .expect(Components.Input)
        .to(haveFocus());
    });

    it('to() extension -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(Components.Text)
          .to(haveFocus());

        fail();
      } catch {}
    });

    it('does/has/is/gets() extension', () => {
      const emitTimes: <T>(
        event: Exclude<keyof T, Symbol | number>,
        times: number,
      ) => DeclarativeTestExtension<
        HTMLElement,
        T,
        HTMLElement,
        unknown,
        any
      > = (event: string, times: number) => (_, fx) => {
        return {
          predicate: () => {
            for (let i = 0; i < times; i++) {
              fx.rootElement.componentInstance[event].emit();
            }
          },
        };
      };

      When(host)
        .does(emitTimes('textChange', 2))
        .expect(host)
        .toEmit('textChange', { times: 2 });

      When(host)
        .has(emitTimes('textChange', 2))
        .expect(host)
        .toEmit('textChange', { times: 2 });

      When(host)
        .is(emitTimes('textChange', 2))
        .expect(host)
        .toEmit('textChange', { times: 2 });

      When(host)
        .gets(emitTimes('textChange', 2))
        .expect(host)
        .toEmit('textChange', { times: 2 });
    });

    it('calls', () => {
      When(host)
        .calls('onChange', 42)
        .expect(host)
        .toHaveCalled(componentMethod, 'onChange', { args: [42], times: 1 });

      When(host)
        .rendered()
        .and(then(host).calls('onChange', 42))
        .expect(host)
        .toHaveCalled(componentMethod, 'onChange', { args: [42], times: 1 });
    });

    it('should provide a spyFactory function in extensions', () => {
      const assertSpyFactory: DeclarativeTestExtension<
        HTMLElement,
        any,
        HTMLElement,
        any,
        any
      > = ({ assertion }, _, factory) => {
        return {
          assertion: () => {
            assertion?.();

            expect(factory).toBeInstanceOf(Function);
            expect(factory()).toBeTruthy();
            expect(factory(42)()).toBe(42);
          },
        };
      };

      When(host)
        .does(assertSpyFactory)
        .and(assertSpyFactory)
        .expect(host)
        .to(assertSpyFactory);
    });

    it('injected', fakeAsync(() => {
      When(host)
        .calls('asyncOperation')
        .and(waitFakeAsync('animationFrame'))
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod');
    }));

    it('waitFakeAsync', fakeAsync(() => {
      When(host)
        .calls('asyncOperation')
        .and(waitFakeAsync('animationFrame'))
        .expect(host)
        .toHaveCalled(injected(SomeService), 'someMethod');
    }));

    it('waitFakeAsync -> fail', fakeAsync(() => {
      try {
        When(host)
          .calls('asyncOperation')
          .and(waitFakeAsync(0))
          .expect(host)
          .toHaveCalled(injected(SomeService), 'someMethod');

        fail();
      } catch {}
    }));

    it('provider().hasState()', fakeAsync(() => {
      When(host)
        .rendered()
        .and(provider(SomeService).hasState({ id: 42 }))
        .expect(host)
        .toHaveState({ token: expect.objectContaining({ id: 42 }) });
    }));

    it('provider().hasState() -> fail', fakeAsync(() => {
      try {
        When(host)
          .rendered()
          .and(provider(SomeService).hasState({ id: 42 }))
          .expect(host)
          .toHaveState({ token: expect.objectContaining({ id: 0 }) });

        fail();
      } catch {}
    }));

    it('not toHaveCalled', () => {
      When(host)
        .rendered()
        .expect(host)
        .not.toHaveCalled(componentMethod, 'onChange');
    });

    it('not toBeMissing', () => {
      When(host)
        .hasState({ showText: true })
        .expect(Components.Text)
        .not.toBeMissing();
    });

    it('not -> fail', () => {
      try {
        When(host)
          .calls('onChange')
          .expect(host)
          .not.toHaveCalled(componentMethod, 'onChange');

        fail();
      } catch {}
    });

    it('not', () => {
      When(host)
        .rendered()
        .expect(host)
        .not.toHaveCalled(componentMethod, 'onChange');
    });

    it('not (throw runtime error)', () => {
      try {
        When(host)
          .calls('methodThatThrows')
          .expect(host)
          .not.toHaveCalled(componentMethod, 'onChange');

        fail();
      } catch {}
    });

    //#region MultiApi
    it('debugTest', () => {
      When(host)
        .hasState({ items: [1, 2, 3] })
        .expect(Components.NotExistingItems)
        .debugTest();
    });

    it('toBePresent', () => {
      When(host)
        .hasState({ items: [1, 2, 3] })
        .expect(Components.Items)
        .toBeFound({ count: 3 });
    });

    it('toBePresent -> fail', () => {
      try {
        When(host)
          .hasState({ items: [1, 2, 3] })
          .expect(Components.Items)
          .toBeFound({ count: 4 });

        fail();
      } catch {}
    });

    it('toBePresent -> fail', () => {
      When(host)
        .hasState({ items: [1, 2, 3] })
        .expect(Components.Items)
        .not.toBeFound({ count: 4 });
    });

    it('toHaveState -> single argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toHaveStates({ text: expect.any(Number) });
    });

    it('toHaveState -> array argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toHaveStates([
          { text: 1 },
          { text: 2 },
          { text: 3 },
          { text: 4 },
          { text: 5 },
        ]);
    });

    it('toHaveState -> array not matching found items length', () => {
      expect(() =>
        When(host)
          .hasState({ items: [1, 2, 3] })
          .expect(Components.Items)
          .toHaveStates([{ text: 1 }, { text: 2 }]),
      ).toThrow();
    });

    it('toHaveState -> not', () => {
      When(host)
        .hasState({ items: [1, 2, 3] })
        .expect(Components.Items)
        .not.toHaveStates([{ text: 4 }, { text: 5 }, { text: 6 }]);
    });

    it('toHaveCssClasses', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toHaveCssClasses([
          ['item', 'index'],
          'item',
          ['item', 'index'],
          'item',
          ['item', 'index'],
        ]);
    });

    it('toHaveCssClasses -> fail', () => {
      expect(() =>
        When(host)
          .hasState({ items: [1, 2, 3, 4, 5] })
          .expect(Components.Items)
          .toHaveCssClasses([
            ['item', 'index'],
            ['item', 'index'],
            ['item', 'index'],
            'item',
            'item',
          ]),
      ).toThrow();
    });

    it('toHaveTexts -> array argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toHaveTexts(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
    });

    it('toHaveTexts -> array not matching found items length', () => {
      expect(() =>
        When(host)
          .hasState({ items: [1, 2, 3] })
          .expect(Components.Items)
          .toHaveTexts(['Item 1', 'Item 2']),
      ).toThrow();
    });

    it('toHaveTexts -> single argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toHaveTexts(expect.stringMatching(/Item \d/));
    });

    it('toContainTexts -> array argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toContainTexts(['1', '2', '3', '4', '5']);
    });

    it('toContainTexts -> array not matching found items length', () => {
      expect(() =>
        When(host)
          .hasState({ items: [1, 2, 3] })
          .expect(Components.Items)
          .toContainTexts(['1', '2']),
      ).toThrow();
    });

    it('toContainTexts -> single argument', () => {
      When(host)
        .hasState({ items: [1, 2, 3, 4, 5] })
        .expect(Components.Items)
        .toContainTexts('Item');
    });

    //#endregion
  }),
);

const haveFocus =
  <T extends HTMLElement>(): DeclarativeTestExtension<
    HTMLElement,
    any,
    T,
    any,
    PartRef<T, any>
  > =>
  ({ assertion, object }) => {
    return {
      assertion: () => {
        assertion?.();
        expect(document.activeElement).toBe(object!().nativeElement);
      },
    };
  };
