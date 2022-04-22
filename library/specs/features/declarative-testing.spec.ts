import { Component, EventEmitter, Output } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import {
  assertEmission,
  callsLifeCycleHooks,
  provider,
  tap,
  then,
  waitFakeAsync,
} from '../../features/declarative-testing';
import {
  DeclarativeTestExtension,
  EmissionOptions,
} from '../../features/types';
import { ngtx } from '../../ngtx';

class SomeService {
  id = 0;
  someMethod(anyNumber: number) {}
}

@Component({
  template: `
    <div [class.text-shown]="showText">
      <input #txt [value]="text" (change)="onChange($event.target.value)" />
      <button (click)="onChange($event); txt.focus()">Click to set text</button>
      <p *ngIf="showText">{{ text }}</p>
    </div>
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

  asyncOperation() {
    requestAnimationFrame(() => {
      this.token.someMethod(42);
    });
  }
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
      static Container() {
        return get('div');
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

    it('toHaveClass', () => {
      When(host)
        .hasState({ showText: true })
        .expect(Components.Container)
        .toHaveCssClass('text-shown');
    });

    it('toHaveCalledService', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalledService(SomeService, 'someMethod', {
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
          .toHaveCalledService(SomeService, 'someMethod');

        fail();
      } catch {}
    });

    it('toHaveCalled { times }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalledService(SomeService, 'someMethod', { times: 1 });
    });

    it('toHaveCalled { times } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalledService(SomeService, 'someMethod', { times: 2 });

        fail();
      } catch {}
    });

    it('toHaveCalled { args }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalledService(SomeService, 'someMethod', { args: 42 });
    });

    it('toHaveCalled { args } -> fail', () => {
      try {
        When(Components.Button)
          .emits('click')
          .expect(host)
          .toHaveCalledService(SomeService, 'someMethod', { args: null });

        fail();
      } catch {}
    });

    it('toHaveCalled { whichReturns }', () => {
      When(Components.Button)
        .emits('click')
        .expect(host)
        .toHaveCalledService(SomeService, 'someMethod', {
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

    it('does/has/is() extension', () => {
      const emitTimes: <T>(
        event: Exclude<keyof T, Symbol | number>,
        times: number,
      ) => DeclarativeTestExtension<any, any, T> =
        (event: string, times: number) => (_, fx) => {
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
    });

    it('calls', () => {
      const haveCalled: (
        method: string,
        opts?: Omit<EmissionOptions, 'whichReturns'>,
      ) => DeclarativeTestExtension<any, any> =
        (method: string, opts: EmissionOptions = {}) =>
        ({ object, predicate }) => {
          return {
            predicate: () => {
              object().componentInstance[method] = jest.fn();
              predicate();
            },
            assertion: () => {
              assertEmission(object().componentInstance[method], opts);
            },
          };
        };

      When(host)
        .calls('onChange', 42)
        .expect(host)
        .to(haveCalled('onChange', { args: 42, times: 1 }));

      When(host)
        .rendered()
        .and(then(host).calls('onChange', 42))
        .expect(host)
        .to(haveCalled('onChange', { args: 42, times: 1 }));
    });

    it('should provide a spyFactory function in extensions', () => {
      const assertSpyFactory: DeclarativeTestExtension<any, any> = (
        { assertion },
        _,
        factory,
      ) => {
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

    it('waitFakeAsync', fakeAsync(() => {
      When(host)
        .calls('asyncOperation')
        .and(waitFakeAsync('animationFrame'))
        .expect(host)
        .toHaveCalledService(SomeService, 'someMethod');
    }));

    it('waitFakeAsync -> fail', fakeAsync(() => {
      try {
        When(host)
          .calls('asyncOperation')
          .and(waitFakeAsync(0))
          .expect(host)
          .toHaveCalledService(SomeService, 'someMethod');

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
