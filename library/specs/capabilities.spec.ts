import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Capabilities } from '../declarative-testing/capabilities';
import { createExtension } from '../declarative-testing/declarative-testing';
import {
  classMember,
  componentMethod,
  detectChanges,
  haveCalled,
  haveState,
  state,
} from '../declarative-testing/lib';
import { PropertyValueDescriptor } from '../declarative-testing/types';
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
  @Input() tags: string[] = [];
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

const valueProperty: PropertyValueDescriptor<{ value: string }, 'value'> = {
  name: 'value',
  defaultSetterValue: '',
  defaultAssertionValue: expect.any(String),
};

const extensionSpy = jest.fn();
const testExtension = createExtension((_, { addPredicate }) => {
  addPredicate(extensionSpy);
});

class ItemCapabilities extends Capabilities<ItemComponent> {
  public hasValue = this.actions
    .setProperty(valueProperty)
    .and(testExtension)
    .done();
  public toHaveValue = this.assert.property(valueProperty).done();
  public activates = this.actions.emitEvent({ name: 'activate' }).done();
  public toHaveBeenActivated = this.assert
    .eventEmission({ name: 'activate' })
    .done();

  public hasTags = this.actions.setProperty({ name: 'tags' }).done();
  public toHaveTags = this.assert
    .property({
      name: 'tags',
      isArrayProperty: true,
      defaultAssertionValue: expect.any(Array),
    })
    .done();
}

describe(
  'Capabilities',
  ngtx<ListComponent>(({ useFixture, When, host, get, getAll }) => {
    let fixture: ComponentFixture<ListComponent>;
    const FirstItem = () => get(ItemComponent);

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
        .expect(the.Items.first().toHaveValue('a'));
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
        .expect(the.Items.first().not.toHaveValue('b'));
    });

    it('negation should be stateless', () => {
      const items = ['a', 'b', 'c'];
      When(host)
        .has(state({ items }))
        .expect(the.Items.not.toHaveValue('something'));

      // hint: if negation is not stateless, the previous "not"-call will already have set "not" to true,
      // causing calling it again this time "resets" it back to "false":
      When(host)
        .has(state({ items }))
        .expect(the.Items.not.toHaveValue('something'));
    });

    it('should work for prop setter', () => {
      When(the.Items.first().hasValue('test'))
        .and(detectChanges({ viaChangeDetectorRef: true }))
        .expect(FirstItem)
        .to(haveState({ value: 'test' }));
    });

    it('should work for prop assertions', () => {
      When(FirstItem)
        .has(state({ value: 'test' }))
        .and(detectChanges({ viaChangeDetectorRef: true }))
        .expect(the.Items.first().toHaveValue('test'));
    });

    it('should work for event emitter', () => {
      When(the.Items.first().activates('eventArg'))
        .expect(host)
        .to(
          haveCalled(componentMethod, 'select', {
            args: ['eventArg'],
          }),
        );
    });

    it('should work for event emission assertions', () => {
      When(FirstItem)
        .calls(classMember('activate'), 'emit', ['42'])
        .expect(
          the.Items.first().toHaveBeenActivated({
            arg: '42',
          }),
        );
    });

    it('should assert array property correctly (single state for all)', () => {
      When(the.Items.hasTags(['a', 'b', 'c'])).expect(
        the.Items.toHaveTags(['a', 'b', 'c']),
      );
    });

    it('should assert array property correctly (specific state for each item)', () => {
      When(the.Items.nth(1).hasTags(['a']))
        .and(the.Items.nth(2).hasTags(['b', 'c']))
        .expect(the.Items.toHaveTags([['a'], ['b', 'c'], []]));
    });

    it('should assert array property correctly (default value)', () => {
      When(the.Items.nth(1).hasTags(['a'])).expect(the.Items.toHaveTags());
    });

    it('should call extension functions in "and"', () => {
      // hint: test not pure. dependent on global "extensionSpy" fn.
      expect(extensionSpy).toHaveBeenCalled();
    });
  }),
);
