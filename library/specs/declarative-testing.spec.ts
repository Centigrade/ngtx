import {
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  Output,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { allOrNth } from '../declarative-testing/helpers';
import {
  attributes,
  beFound,
  beMissing,
  call,
  callLifeCycleHook,
  clicked,
  componentMethod,
  containText,
  debug,
  haveAttributes,
  haveCalled,
  haveCssClass,
  haveEmitted,
  haveState,
  haveStyle,
  haveText,
  injected,
  nativeEvent,
  nativeMethod,
  state,
} from '../declarative-testing/lib';
import { ngtx } from '../ngtx';

@Injectable()
abstract class AlertBaseService {
  abstract show(msg: string): void;
}

@Injectable()
class AlertService extends AlertBaseService {
  show(msg: string): void {
    console.log(msg);
  }
}

@Component({
  selector: 'app-dropdown-item',
  template: `
    <section
      data-ngtx="dropdown-item:content-container"
      [attr.title]="value || null"
      (click)="showDialog()"
    >
      <ng-content></ng-content>
    </section>
  `,
})
class DropDownItemComponent {
  @Input() value!: string;
  @Output() activate = new EventEmitter<string>();

  constructor(private alert: AlertBaseService) {}

  public showDialog(): void {
    this.alert.show(`You clicked the option "${this.value}"`);
    this.activate.emit(this.value);
  }
}

@Component({
  selector: 'app-dropdown',
  template: `
    <section (click)="toggle($event)" data-ngtx="dropdown:toggle">
      {{ value }}
    </section>
    <section *ngIf="opened" data-ngtx="dropdown:item-container">
      <app-dropdown-item
        *ngFor="let item of items"
        class="item"
        [class.selected]="item === value"
        [style.color]="'red'"
        [value]="item"
        (activate)="value = item"
      >
        {{ item }}
      </app-dropdown-item>
    </section>
  `,
})
class DropDownComponent {
  @Input() value?: string;
  @Input() items: string[] = [];
  @Input() opened = false;
  @Output() openedChange = new EventEmitter<boolean>();

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'Enter') {
      this.toggle();
    }
  }

  ngOnInit = jest.fn();
  ngOnDestroy = jest.fn();
  ngAfterContentInit = jest.fn();
  ngAfterViewInit = jest.fn();
  ngOnChanges = jest.fn();

  public sideEffect = false;

  public toggle(triggerSideEffect?: boolean): void {
    if (triggerSideEffect) {
      this.sideEffect = true;
    }

    this.opened = !this.opened;
  }
  public open(): void {
    this.opened = true;
    this.openedChange.emit(true);
  }
  public close(): void {
    this.opened = false;
    this.openedChange.emit(false);
  }
}

describe(
  'Declarative Tests',
  ngtx<DropDownComponent>(({ useFixture, When, host, get, getAll }) => {
    let fixture: ComponentFixture<DropDownComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DropDownComponent, DropDownItemComponent],
        providers: [{ provide: AlertBaseService, useClass: AlertService }],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DropDownComponent);
      useFixture(fixture, {
        spyFactory: (retValue) => jest.fn(() => retValue),
      });
    });

    class the {
      static Toggle() {
        return get('ngtx_dropdown:toggle');
      }
      static ItemsContainer() {
        return get('ngtx_dropdown:item-container');
      }
      static Items = allOrNth(DropDownItemComponent, getAll);
      static ItemContainers = allOrNth<HTMLDivElement, unknown>(
        'ngtx_dropdown-item:content-container',
        getAll,
      );
      static NotExistingTarget() {
        return get('.not-existing');
      }
    }

    it('should allow multiple assertions passed in via expect', () => {
      const toBeOpened = When(host)
        .rendered()
        .expect(host)
        .will(haveState({ opened: true }));
      const toHaveOneItem = When(host)
        .rendered()
        .expect(host)
        .will(haveState({ items: ['a'] }));

      When(host)
        .has(state({ opened: true, items: ['a'] }))
        .expect(toBeOpened, toHaveOneItem);
    });

    it('and (chaining - 1)', () => {
      const setItems = When(host).has(state({ items: [1, 2, 3] }));

      When(host)
        .rendered()
        .and(setItems)
        .expect(host)
        .to(haveState({ items: [1, 2, 3] }));
    });

    it('and (chaining - 2)', () => {
      const setItems = When(host)
        .has(state({ items: [1, 2, 3] }))
        .and(call(componentMethod, 'open'));

      When(host)
        .rendered()
        .and(setItems)
        .expect(host)
        .to(
          haveState({ items: [1, 2, 3] }),
          haveCalled(componentMethod, 'open'),
        );
    });

    it('and(...extensions)', () => {
      When(host)
        .rendered()
        .and(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items)
        .to(haveState([{ value: 'a' }, { value: 'b' }, { value: 'c' }]));
    });

    it('callLifeCycleHook', () => {
      fixture.detectChanges = jest.fn();

      When(host)
        .rendered()
        .and(
          callLifeCycleHook({
            ngOnInit: true,
            ngOnChanges: { value: 42 },
            ngAfterContentInit: true,
            ngAfterViewInit: true,
            ngOnDestroy: true,
          }),
        )
        .expect(host)
        .to(
          haveCalled(componentMethod, 'ngOnInit'),
          haveCalled(componentMethod, 'ngOnChanges', {
            args: [{ value: 42 }],
          }),
          haveCalled(componentMethod, 'ngAfterContentInit'),
          haveCalled(componentMethod, 'ngAfterViewInit'),
          haveCalled(componentMethod, 'ngOnDestroy'),
        );

      expect(fixture.detectChanges).toHaveBeenCalledTimes(1);
    });

    it('callLifeCycleHook (target not found)', () => {
      expectToThrowNotFoundError(() =>
        When(the.NotExistingTarget)
          .does(
            callLifeCycleHook({
              ngOnInit: true,
              ngOnChanges: {
                value: 42,
              },
              ngAfterViewInit: true,
              ngOnDestroy: true,
            }) as any,
          )
          .expect(host)
          .to(),
      );
    });

    it('state -> haveState (single)', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items)
        .to(haveState({ value: expect.any(String) }));
    });

    it('state -> haveState (multiple)', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items)
        .to(haveState([{ value: 'a' }, { value: 'b' }, { value: 'c' }]));
    });

    it('state -> haveState (function)', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items)
        .to(haveState((index) => ({ value: 'abc'[index] })));
    });

    it('haveState (target not found)', () => {
      expectToThrowNotFoundError(() =>
        When(host).rendered().expect(the.NotExistingTarget).to(haveState({})),
      );
    });

    it('attributes -> haveAttributes (single)', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .and(the.ItemContainers)
        .have(attributes([{ title: 'title a' }, { title: 'title b' }]))
        .and(
          debug({
            attributesOf: the.ItemContainers,
            attributeFilter: (a) => ['style', 'tagname'].includes(a),
          }),
        )
        .expect(the.ItemContainers)
        .to(haveAttributes({ title: expect.stringContaining('title ') }));
    });

    it('attributes -> haveAttributes (multiple)', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .and(the.ItemContainers)
        .have(attributes([{ title: 'title a' }, { title: 'title b' }]))
        .expect(the.ItemContainers)
        .to(haveAttributes([{ title: 'title a' }, { title: 'title b' }]));
    });

    it('attributes -> haveAttributes (function)', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .and(the.ItemContainers)
        .have(attributes([{ title: 'title a' }, { title: 'title b' }]))
        .expect(the.ItemContainers)
        .to(haveAttributes((index) => ({ title: 'title ' + 'ab'[index] })));
    });

    it('haveAttributes (target not found)', () => {
      expectToThrowNotFoundError(() =>
        When(host)
          .rendered()
          .expect(the.NotExistingTarget)
          .to(haveAttributes({})),
      );
    });

    it('attributes (not found)', () => {
      expectToThrowNotFoundError(() =>
        When(the.NotExistingTarget)
          .has(attributes({ title: 'title' }))
          .expect(the.ItemContainers)
          .to(haveAttributes((index) => ({ title: 'title ' + 'ab'[index] }))),
      );
    });

    it('attributes -> haveAttributes (not found)', () => {
      expectToThrowNotFoundError(() =>
        When(host)
          .rendered()
          .expect(the.NotExistingTarget)
          .to(haveAttributes({})),
      );
    });

    it('haveStyle -> single', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .expect(the.Items.first)
        .to(haveStyle({ color: 'red' }));
    });

    it('haveStyle -> multiple, passed in one argument', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.Items)
        .to(haveStyle({ color: 'red' }));
    });

    it('haveStyle -> multiple, passed in multiple arguments', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.Items)
        .to(haveStyle([{ color: 'red' }, { color: 'red' }]));
    });

    [null, undefined].forEach((nullish) => {
      it('haveStyle -> multiple, passed in multiple & skipped arguments', () => {
        When(host)
          .has(state({ items: ['a', 'b'], opened: true }))
          .expect(the.Items)
          .to(haveStyle([nullish, { color: 'red' }]));
      });
    });

    it('haveStyle -> single, negated', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .expect(the.Items.first)
        .not.to(haveStyle({ color: 'yellow' }));
    });

    it('haveStyle -> multiple, passed in one argument, negated', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.Items)
        .not.to(haveStyle({ color: 'yellow' }));
    });

    it('haveStyle -> multiple, passed in multiple arguments, negated', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.Items)
        .not.to(haveStyle([{ color: 'yellow' }, { color: 'yellow' }]));
    });

    [null, undefined].forEach((nullish) => {
      it('haveStyle -> multiple, passed in multiple & skipped arguments, negated', () => {
        When(host)
          .has(state({ items: ['a', 'b'], opened: true }))
          .expect(the.Items)
          .not.to(haveStyle([nullish, { color: 'yellow' }]));
      });
    });

    it('haveCssClass', () => {
      When(host)
        .has(state({ items: ['a', 'b'], value: 'b', opened: true }))
        .expect(the.Items)
        .to(haveCssClass(['item', ['item', 'selected']]));
    });

    it('haveCssClass -> skip', () => {
      When(host)
        .has(state({ items: ['a', 'b'], value: 'b', opened: true }))
        .expect(the.Items)
        .to(haveCssClass([undefined, ['item', 'selected']]));
    });

    it('haveCssClass -> single argument', () => {
      When(host)
        .has(state({ items: ['a', 'b'], value: 'b', opened: true }))
        .expect(the.Items)
        .to(haveCssClass('item'));
    });

    it('haveCssClass -> target not found', () => {
      expectToThrowNotFoundError(() =>
        When(host)
          .rendered()
          .expect(the.NotExistingTarget)
          .to(haveCssClass('item')),
      );
    });

    it('haveText', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.ItemContainers)
        .to(haveText(['a', 'b']));
    });

    it('haveText -> skip', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .expect(the.ItemContainers)
        .to(haveText([undefined, 'b']));
    });

    it('haveText -> target not found', () => {
      expectToThrowNotFoundError(() =>
        When(host)
          .rendered()
          .expect(the.NotExistingTarget)
          .to(haveText([undefined])),
      );
    });

    it('containText', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText(['a', 'b']));
    });

    it('containText -> single', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText('item'));
    });

    it('containText -> skip', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText([undefined, 'b']));
    });

    it('containText -> target not found', () => {
      expectToThrowNotFoundError(() =>
        When(host).rendered().expect(the.NotExistingTarget).to(containText('')),
      );
    });

    it('emits', () => {
      When(host)
        .has(
          state({
            value: undefined,
            items: ['a', 'b', 'c'],
            opened: true,
          }),
        )
        .and(the.Items.nth(2))
        .emits('activate')
        .expect(host)
        .to(haveState({ value: 'b' }));
    });

    it('emits -> nativeEvent', () => {
      When(the.Toggle)
        .emits(nativeEvent<HTMLElement>('click'))
        .expect(host)
        .to(haveCalled(componentMethod, 'toggle'));
    });

    it('emits -> nativeEvent(EventType)', () => {
      When(the.Toggle)
        .emits(
          nativeEvent<HTMLElement>(
            new KeyboardEvent('keydown', {
              ctrlKey: true,
              key: 'Enter',
              bubbles: true,
            }),
          ),
        )
        .expect(host)
        .to(haveCalled(componentMethod, 'toggle'));
    });

    it('emits -> nativeEvent(EventType) -> fail', () => {
      When(the.Toggle)
        .emits(
          nativeEvent<HTMLElement>(
            new KeyboardEvent('keydown', {
              ctrlKey: true,
              key: 'p',
              bubbles: true,
            }),
          ),
        )
        .expect(host)
        .not.to(haveCalled(componentMethod, 'toggle'));
    });

    it('emits (target not found)', () => {
      expectToThrowNotFoundError(() =>
        When(the.NotExistingTarget).emits('').expect(host).to(haveState({})),
      );
    });

    it('beFound', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: true }))
        .expect(the.Items)
        .to(beFound());
    });

    it('beFound -> times', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: true }))
        .expect(the.Items)
        .to(beFound({ times: 3 }));
    });

    it('beFound -> not', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: false }))
        .expect(the.Items)
        .not.to(beFound());
    });

    it('beFound -> not -> times', () => {
      When(host)
        .has(state({ items: [1], opened: true }))
        .expect(the.Items)
        .not.to(beFound({ times: 3 }));
    });

    it('beMissing', () => {
      When(host)
        .has(state({ items: [1], opened: false }))
        .expect(the.Items)
        .to(beMissing());
    });

    it('beMissing -> not', () => {
      When(host)
        .has(state({ items: [1], opened: true }))
        .expect(the.Items)
        .not.to(beMissing());
    });

    it('clicked', () => {
      expect(host().componentInstance.opened).toBe(false);

      When(the.Toggle)
        .gets(clicked())
        .expect(host)
        .to(haveState({ opened: true }));
    });

    it('clicked -> eventArgs', () => {
      expect(host().componentInstance.sideEffect).toBe(false);

      When(the.Toggle)
        .gets(clicked({ eventArgs: true }))
        .expect(host)
        .to(haveState({ sideEffect: true }));
    });

    it('clicked -> nativeClick', () => {
      When(the.Toggle)
        .gets(clicked({ nativeClick: true }))
        .expect(the.Toggle)
        .to(haveCalled(nativeMethod, 'click'));
    });

    it('clicked (not found)', () => {
      expectToThrowNotFoundError(() =>
        When(the.NotExistingTarget)
          .gets(clicked({ nativeClick: true }))
          .expect(the.Toggle)
          .to(haveCalled(nativeMethod, 'click')),
      );
    });

    it('call(componentMethod)', () => {
      When(host)
        .has(state({ opened: false }))
        .and(call(componentMethod, 'open'))
        .expect(host)
        .to(haveState({ opened: true }));
    });

    it('call(nativeMethod)', () => {
      When(host)
        .has(state({ opened: false }))
        .and(the.Toggle)
        .calls(nativeMethod, 'click')
        .expect(host)
        .to(haveState({ opened: true }));
    });

    it('call(injected)', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .and(the.Items.first)
        .calls(injected(DropDownComponent), 'close')
        .expect(host)
        .to(haveState({ opened: false }));
    });

    it('call(withArgs)', () => {
      When(host)
        .calls(componentMethod, 'close', [1, 2, 3])
        .expect(host)
        .to(haveCalled(componentMethod, 'close', { args: [1, 2, 3] }));
    });

    it('call (target not found)', () => {
      expectToThrowNotFoundError(() =>
        When(the.NotExistingTarget)
          .calls(injected(AlertService), 'show')
          .expect(host)
          .to(haveState({ opened: true })),
      );
    });

    it('haveCalled (registerable before first predicate)', () => {
      When(host)
        .does(call(componentMethod, 'open'))
        .expect(host)
        .to(haveCalled(componentMethod, 'open'));
    });

    it('haveCalled (registerable after first predicate)', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .and(the.ItemContainers)
        .calls(injected(DropDownComponent), 'open')
        .expect(the.ItemContainers)
        .to(haveCalled(injected(DropDownComponent), 'open'));
    });

    it('haveCalled (abstract provider)', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .and(the.ItemContainers.first)
        .gets(clicked())
        .expect(the.ItemContainers)
        .to(haveCalled(injected(AlertBaseService), 'show'));
    });

    it('haveCalled (spy-instance)', () => {
      const spy = jest.fn();

      When(host)
        .has(state({ toggle: spy }))
        .and(call(componentMethod, 'toggle'))
        .and(call(componentMethod, 'toggle'))
        .expect(host)
        .to(haveCalled(spy, { times: 2 }));
    });

    it('haveEmitted (registerable before first predicate)', () => {
      When(host)
        .calls(componentMethod, 'open')
        .expect(host)
        .to(haveEmitted('openedChange', { arg: true }));
    });

    it('haveEmitted (registerable after first predicate)', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .and(the.ItemContainers.first)
        .gets(clicked())
        .expect(the.Items.first)
        .to(haveEmitted('activate', { arg: 'a' }));
    });

    it('should throw if a spy could not be placed correctly', () => {
      expect(() =>
        When(host)
          .rendered()
          .expect(the.NotExistingTarget)
          .not.to(haveCalled(componentMethod, 'click')),
      ).toThrow(/spies/);
    });

    it('should allow plugin chaining', () => {
      const hostHasValueAbc = When(host).has(state({ value: 'abc' }));
      const hostToHaveValueAbc = When(host)
        .rendered()
        .expect(host)
        .will(haveState({ value: 'abc' }));

      When(hostHasValueAbc).expect(hostToHaveValueAbc);
    });
  }),
);

// --------------------- utility ------------------
function expectToThrowNotFoundError(fn: Function): void {
  expect(fn).toThrow(/wasn\'t found/i);
}
