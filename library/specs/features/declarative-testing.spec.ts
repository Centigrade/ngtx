import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { allOrNth } from '../../declarative-testing/harnesses';
import {
  and,
  attributes,
  beFound,
  beMissing,
  call,
  clicked,
  componentMethod,
  containText,
  haveAttributes,
  haveCalled,
  haveEmitted,
  haveState,
  haveText,
  injected,
  nativeMethod,
  state,
} from '../../declarative-testing/lib';
import { ngtx } from '../../ngtx';
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
    <section (click)="toggle()" data-ngtx="dropdown:toggle">
      {{ value }}
    </section>
    <section *ngIf="opened" data-ngtx="dropdown:item-container">
      <app-dropdown-item
        *ngFor="let item of items"
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

  public toggle(): void {
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
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DropDownComponent, DropDownItemComponent],
        providers: [{ provide: AlertBaseService, useClass: AlertService }],
      }).compileComponents();
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(DropDownComponent);
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
      static ItemContainers = allOrNth<HTMLElement, HTMLDivElement>(
        'ngtx_dropdown-item:content-container',
        getAll,
      );
      static NotExistingTarget() {
        return get('.not-existing');
      }
    }

    it('state -> haveState', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items)
        .to(haveState([{ value: 'a' }, { value: 'b' }, { value: 'c' }]));
    });

    it('attributes -> haveAttributes', () => {
      When(host)
        .has(state({ items: ['a', 'b'], opened: true }))
        .and(the.ItemContainers)
        .have(attributes([{ title: 'title a' }, { title: 'title b' }]))
        .expect(the.ItemContainers)
        .to(haveAttributes([{ title: 'title a' }, { title: 'title b' }]));
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

    it('containText', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText(['a', 'b']));
    });

    it('containText -> skip', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText([undefined, 'b']));
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

    it('beFound', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: true }))
        .expect(the.Items)
        .to(beFound());
    });

    it('beFound -> count', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: true }))
        .expect(the.Items)
        .to(beFound({ count: 3 }));
    });

    it('beFound -> not', () => {
      When(host)
        .has(state({ items: [1, 2, 3], opened: false }))
        .expect(the.Items)
        .not.to(beFound());
    });

    it('beFound -> not -> count', () => {
      When(host)
        .has(state({ items: [1], opened: true }))
        .expect(the.Items)
        .not.to(beFound({ count: 3 }));
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
      When(the.Toggle)
        .gets(clicked({ nativeClick: true }))
        .expect(the.Toggle)
        .to(haveCalled(nativeMethod, 'click'));
    });

    it('call(componentMethod)', () => {
      When(host)
        .has(state({ opened: false }), and(call(componentMethod, 'open')))
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
      ).toThrowError(/spies/);
    });
  }),
);
