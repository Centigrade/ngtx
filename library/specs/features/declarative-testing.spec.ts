import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  and,
  attributes,
  call,
  componentMethod,
  containText,
  emit,
  haveAttributes,
  haveCalled,
  haveState,
  haveText,
  injected,
  nativeMethod,
  state,
} from '../../declarative-testing/lib';
import { ngtx } from '../../ngtx';

@Component({
  selector: 'app-dropdown-item',
  template: `
    <section
      data-ngtx="dropdown-item:content-container"
      [attr.title]="value || null"
      (click)="activate.emit()"
    >
      <ng-content></ng-content>
    </section>
  `,
})
class DropDownItemComponent {
  @Input() value!: string;
  @Output() activate = new EventEmitter<void>();
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
  }
  public close(): void {
    this.opened = false;
  }
}

describe(
  'Declarative Tests',
  ngtx<DropDownComponent>(({ useFixture, When, host, get, getAll }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DropDownComponent, DropDownItemComponent],
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
      static Items(nth?: number) {
        return () => {
          const matches = getAll(DropDownItemComponent);
          return nth ? matches.nth(nth) : matches;
        };
      }
      static ItemContainers() {
        return getAll('ngtx_dropdown-item:content-container');
      }
    }

    it('state -> haveState', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items())
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

    it('containText', () => {
      When(host)
        .has(state({ items: ['item a', 'item b'], opened: true }))
        .expect(the.ItemContainers)
        .to(containText(['a', 'b']));
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
        .and(the.Items(2))
        .does(emit('activate'))
        .expect(host)
        .to(haveState({ value: 'b' }));
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
        .does(call(nativeMethod, 'click'))
        .expect(host)
        .to(haveState({ opened: true }));
    });

    it('call(injected)', () => {
      When(host)
        .has(state({ items: ['a'], opened: true }))
        .and(the.Items(1))
        .does(call(injected(DropDownComponent), 'close'))
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
        .does(call(injected(DropDownComponent), 'open'))
        .expect(the.ItemContainers)
        .to(haveCalled(injected(DropDownComponent), 'open'));
    });
  }),
);
