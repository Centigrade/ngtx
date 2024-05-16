import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentHarness } from '../declarative-testing/component-harness';
import {
  beFound,
  componentMethod,
  detectChanges,
  haveCalled,
  haveState,
  state,
} from '../declarative-testing/lib';
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

class ItemCapabilities extends ComponentHarness<ItemComponent> {
  public toHaveSection() {
    return this.expect(() => this.get('section')).will(beFound());
  }
  public toHaveSections() {
    return this.expect(() => this.getAll('section')).will(beFound());
  }
  public hasValue(value: string) {
    return this.whenComponent.has(state({ value }));
  }
  public toHaveValue(value: string) {
    return this.expectComponent.will(haveState({ value }));
  }
  public activates(arg?: any) {
    return this.whenComponent.emits('activate', arg);
  }
  public hasTags(tags: string[]) {
    return this.whenComponent.has(state({ tags }));
  }
  public toHaveTags(tags?: string[]) {
    return this.expectComponent.will(
      haveState({ tags: tags ?? expect.any(Array) }),
    );
  }
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

    it('should work negated for all items', () => {
      When(host).rendered().expect(the.Items.not.toHaveValue('not-existing'));
    });

    it('[to] should work', () => {
      When(host)
        .has(state({ items: ['a', 'b', 'c'] }))
        .expect(the.Items.to(beFound({ times: 3 })));
    });

    it('[to] should work negated', () => {
      When(host)
        .rendered()
        .expect(the.Items.not.to(haveState({ value: 'not-existing' })));
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
      // causing calling it again this time "resets" it back to "false".
      // we expect it to be stateless though, so the following duplication must not cause problems:
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

    it('should assert array property correctly (single state for all)', () => {
      When(the.Items.hasTags(['a', 'b', 'c'])).expect(
        the.Items.toHaveTags(['a', 'b', 'c']),
      );
    });

    it('should assert array property correctly (default value)', () => {
      When(the.Items.nth(1).hasTags(['a'])).expect(the.Items.toHaveTags());
    });

    it('should find internal component targets with get', () => {
      When(host).rendered().expect(the.Items.toHaveSection());
    });

    it('should find internal component targets with getAll', () => {
      When(host).rendered().expect(the.Items.toHaveSections());
    });
  }),
);
