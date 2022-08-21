import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Capabilities } from '../declarative-testing/capabilities';
import { haveEmitted, haveState, state } from '../declarative-testing/lib';
import { ngtx } from '../ngtx';

@Component({
  selector: 'app-item',
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
class ItemComponent {
  @Input() value!: string;
  @Output() activate = new EventEmitter<string>();
}

@Component({
  template: `
    <app-item
      *ngFor="let i of items"
      [value]="i"
      (activate)="select($event)"
    ></app-item>
  `,
})
class ListComponent {
  @Input() items: string[] = ['a', 'b', 'c'];
  public selected?: string;

  public select(value: string): void {
    this.selected = value;
  }
}

class ItemCapabilities extends Capabilities<ItemComponent> {
  public hasValue(value: string) {
    return this.whenComponents.have(state({ value }));
  }
  public toHaveValue(value: string | string[]) {
    const check = Array.isArray(value)
      ? value.map((x) => ({ value: x }))
      : { value };
    return this.expectComponents.will(haveState(check));
  }
  public activates() {
    return this.whenComponents.emit('activate');
  }
  public toHaveBeenActivated() {
    return this.expectComponents.will(haveEmitted('activate'));
  }
}

describe(
  'Capabilities',
  ngtx<ListComponent>(({ useFixture, When, host, getAll }) => {
    let fixture: ComponentFixture<ListComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ListComponent, ItemComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(ListComponent);
      useFixture(fixture, {
        spyFactory: (retValue) => jest.fn(() => retValue),
      });
    });

    class the {
      static Items = new ItemCapabilities(When, () => getAll(ItemComponent));
    }

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should work for all items', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'] }))
        .expect(the.Items.toBeFound({ times: 3 }));
    });

    it.each([0, 1, 2])('should work for %sth item', (index) => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.atIndex(index).toHaveValue(items[index]));
    });

    it('should work for items', () => {
      const items = ['a', 'b', 'c'];
      When(host).has(state({ items })).expect(the.Items.toHaveValue(items));
    });

    it('should work for nth item', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.nth(1).toHaveValue('a'));
    });

    it('should work for first item', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.first().toHaveValue('a'));
    });

    it('should work for last item', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.last().toHaveValue('c'));
    });

    it('should work for where clauses', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(
          the.Items.where(
            (item) => item.componentInstance.value === 'c',
          ).toHaveValue('c'),
        );
    });

    it('should work for negated assertions', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.nth(1).not.toHaveValue('b'));
    });
  }),
);
