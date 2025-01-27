import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { allOrNth } from '../declarative-testing/helpers';
import { ngtx } from '../ngtx';

@Component({
  standalone: false,
  selector: 'app-child',
  template: '<ng-content></ng-content>',
})
class ChildComponent {}

@Component({
  standalone: false,
  selector: 'app-child-two',
  template: '<ng-content></ng-content>',
})
class Child2Component {}

@Component({
  standalone: false,
  template: `
    <app-child>a</app-child>
    <app-child>b</app-child>
    <app-child>c</app-child>

    <section>a</section>
    <section>b</section>
    <section>c</section>

    <section data-ngtx="item">a</section>
    <app-child-two data-ngtx="item">b</app-child-two>
    <section data-ngtx="item">c</section>
  `,
})
class DemoViewComponent {}

describe(
  'allOrNth',
  ngtx(({ useFixture, getAll }) => {
    let fixture: ComponentFixture<DemoViewComponent> = undefined!;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ChildComponent, Child2Component, DemoViewComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(DemoViewComponent);
      useFixture(fixture);
    });

    class the {
      static NgComponent = allOrNth(ChildComponent, getAll);
      static NgComponent2 = allOrNth(Child2Component, getAll);
      static CssSelector = allOrNth('section', getAll);
      static NgtxId = allOrNth('ngtx_item', getAll);
    }

    //#region atIndex
    it.each([0, 1, 2])(
      '[atIndex/ng-component] should correctly find elements via atIndex',
      (index) => {
        expect(the.NgComponent.atIndex(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index],
        );
      },
    );

    it.each([0, 1, 2])(
      '[atIndex/css-selector] should correctly find elements via atIndex',
      (index) => {
        expect(the.CssSelector.atIndex(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index],
        );
      },
    );

    it.each([0, 1, 2])(
      '[atIndex/ngtx-id] should correctly find elements via atIndex',
      (index) => {
        expect(the.NgtxId.atIndex(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index],
        );
      },
    );
    //#endregion

    //#region nth
    it.each([1, 2, 3])(
      '[nth/ng-component] should correctly find elements via nth',
      (index) => {
        expect(the.NgComponent.nth(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index - 1],
        );
      },
    );

    it.each([1, 2, 3])(
      '[nth/css-selector] should correctly find elements via nth',
      (index) => {
        expect(the.CssSelector.nth(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index - 1],
        );
      },
    );

    it.each([1, 2, 3])(
      '[nth/ngtx-id] should correctly find elements via nth',
      (index) => {
        expect(the.NgtxId.nth(index)().textContent()).toEqual(
          ['a', 'b', 'c'][index - 1],
        );
      },
    );
    //#endregion

    //#region first
    it('[first/ng-component] should correctly find elements via first()', () => {
      expect(the.NgComponent.first().textContent()).toEqual('a');
    });

    it('[first/css-selector] should correctly find elements via first()', () => {
      expect(the.CssSelector.first().textContent()).toEqual('a');
    });

    it('[first/ngtx-id] should correctly find elements via first()', () => {
      expect(the.NgtxId.first().textContent()).toEqual('a');
    });
    //#endregion

    //#region last
    it('[last/ng-component] should correctly find elements via last()', () => {
      expect(the.NgComponent.last().textContent()).toEqual('c');
    });

    it('[last/css-selector] should correctly find elements via last()', () => {
      expect(the.CssSelector.last().textContent()).toEqual('c');
    });

    it('[last/ngtx-id] should correctly find elements via last()', () => {
      expect(the.NgtxId.last().textContent()).toEqual('c');
    });
    //#endregion

    //#region find
    it('[find/ng-component] should correctly find elements via find()', () => {
      expect(
        the.NgComponent.find((n) => n.textContent() === 'b')().textContent(),
      ).toEqual('b');
    });

    it('[find/css-selector] should correctly find elements via find()', () => {
      expect(
        the.CssSelector.find((n) => n.textContent() === 'b')().textContent(),
      ).toEqual('b');
    });

    it('[find/ngtx-id] should correctly find elements via find()', () => {
      expect(
        the.NgtxId.find((n) => n.textContent() === 'b')().textContent(),
      ).toEqual('b');
    });
    //#endregion
  }),
);
