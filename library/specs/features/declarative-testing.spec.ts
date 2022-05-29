import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { emit, haveState, state } from '../../features/lib';
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
    this.opened = true;
  }
}

describe(
  'Declarative Tests',
  ngtx<DropDownComponent>(({ useFixture, When, host, get, getAll }) => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [DropDownComponent, DropDownItemComponent],
      }).compileComponents();

      const fixture = TestBed.createComponent(DropDownComponent);
      useFixture(fixture, {
        spyFactory: (retValue) => jest.fn(() => retValue),
      });
    });

    class the {
      static Toggle() {
        return get('ngtx_dropdown:toggle');
      }
      static ItemContainer() {
        return get('ngtx_dropdown:item-container');
      }

      static Items(nth?: number) {
        return () => {
          const matches = getAll(DropDownItemComponent);
          return nth ? matches.nth(nth) : matches;
        };
      }
    }

    it('state -> haveState', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'], opened: true }))
        .expect(the.Items())
        .to(haveState([{ value: 'a' }, { value: 'b' }, { value: 'c' }]));
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
  }),
);
