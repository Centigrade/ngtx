import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ngtx } from '../ngtx';
import { Expect } from './shared/expect';

@Component({
  standalone: false,
  template: `
    <h1 class="headline">Headline</h1>
    <h2 class="headline">Sub Headline</h2>

    <app-list>
      <app-list-item data-ngtx="item 11">Item 11</app-list-item>
      <app-list-item data-ngtx="item 1">Item 1</app-list-item>
      <app-list-item data-ngtx="item 2">
        <span>Item 2.1</span>
        <span>Item 2.2</span>
        <span>Item 2.3</span>
      </app-list-item>

      <div class="item">Some other type of item</div>
    </app-list>

    <app-list>
      <app-list-item
        *ngFor="let item of dynamicItems"
        [attr.data-ngtx]="'dynamic-item ' + item.name"
      >
        {{ item.name }}
      </app-list-item>
    </app-list>
  `,
})
class GetTestComponent {
  dynamicItems: { name: string }[] = [];
}

@Component({
  standalone: false,
  selector: 'app-list',
  template: '<section> <ng-content></ng-content> </section>',
})
class ListComponent {}

@Component({
  standalone: false,
  selector: 'app-list-item',
  template: '<div> <ng-content></ng-content> </div>',
})
class ListItemComponent {}

@Component({ standalone: false, template: '' })
class NotExistingComponent {}

describe(
  'Feature: NgtxElement.get',
  ngtx(({ useFixture, get }) => {
    let fixture: ComponentFixture<GetTestComponent> = undefined!;
    let component: GetTestComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ListComponent, ListItemComponent, GetTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(GetTestComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    it.each(['h1', '.headline'])(
      'should get elements by css selector "%s"',
      (cssSelector) => {
        // arrange, act
        const h1 = get(cssSelector);
        // assert
        Expect.element(h1).toBeHtmlElement(HTMLHeadingElement);
      },
    );

    it.each([ListComponent, ListItemComponent])(
      'should get elements by directive type "%s"',
      (componentType) => {
        // arrange, act
        const cmp = get(componentType);
        // assert
        Expect.element(cmp).toBeComponent(componentType);
      },
    );

    it('should get elements by ngtx attribute', () => {
      // arrange, act
      const all = fixture.debugElement.queryAll(By.css('[data-ngtx]'));
      const first = get('ngtx_item 11');
      const second = get('ngtx_item 1');
      const withoutId = get('ngtx_item');

      // assert
      expect(withoutId.debugElement).toEqual(all[0]);
      expect(first.debugElement).toEqual(all[0]);
      expect(second.debugElement).toEqual(all[1]);
    });

    it('should get elements by dynamic ngtx attribute', () => {
      // arrange
      const items = [
        { name: 'name 11' },
        { name: 'name 1' },
        { name: 'name 2' },
      ];
      component.dynamicItems = items;
      fixture.detectChanges();

      // act
      const all = fixture.debugElement.queryAll(
        By.css('[data-ngtx*="dynamic-item"]'),
      );
      const first = get('ngtx_name 11');
      const second = get('ngtx_name 1');
      const third = get('ngtx_name 2');

      // assert
      expect(first.debugElement).toEqual(all[0]);
      expect(second.debugElement).toEqual(all[1]);
      expect(third.debugElement).toEqual(all[2]);
    });

    it.each(['.not-existing', NotExistingComponent])(
      'should return null if nothing could be found',
      (selector) => {
        // arrange, act
        const result = get(selector as any);
        // assert
        expect(result).toBeNull();
      },
    );

    it('should be chainable', () => {
      // arrange, act
      const divInsideList = get(ListComponent).get('.item');
      const unreachable = divInsideList.get('app-list');
      const reachable = get('app-list');
      // assert
      Expect.element(divInsideList).toBeHtmlElement(HTMLDivElement);
      expect(unreachable).toBeNull();
      Expect.element(reachable).toBeComponent(ListComponent);
    });

    it('should return the first match of an array-query', () => {
      // arrange, act
      const result1 = get(['.item', ListItemComponent]);
      const result2 = get([ListItemComponent, '.item']);
      const result3 = get([NotExistingComponent, '.item']);
      const result4 = get(['.non-existing', ListItemComponent]);

      // assert
      Expect.element(result1).toBeHtmlElement(HTMLDivElement);
      Expect.element(result2).toBeComponent(ListItemComponent);
      Expect.element(result3).toBeHtmlElement(HTMLDivElement);
      Expect.element(result4).toBeComponent(ListItemComponent);
    });

    it('should return null if nothing matches', () => {
      // arrange, act, assert
      expect(get(['.not-existing', NotExistingComponent])).toBeNull();
    });
  }),
);

describe(
  'Feature: NgtxElement.getAll',
  ngtx(({ useFixture, getAll }) => {
    let fixture: ComponentFixture<GetTestComponent> = undefined!;
    let component: GetTestComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ListComponent, ListItemComponent, GetTestComponent],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(GetTestComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    it('should get all elements by css selector ".headline"', () => {
      // arrange, act
      const h1Elements = getAll('.headline');
      // assert
      expect(h1Elements.length).toBe(2);
      h1Elements.forEach((h1) =>
        Expect.element(h1).toBeHtmlElement(HTMLHeadingElement),
      );
    });

    it('should return null if nothing could be found', () => {
      // arrange, act
      const result = getAll('.not-existing');
      // assert
      expect(result).toBe(null);
    });

    it('should get elements by ngtx attribute', () => {
      // arrange, act
      const all = fixture.debugElement.queryAll(By.css('[data-ngtx]'));
      const firstInHtml = getAll('ngtx_item 11');
      const secondInHtml = getAll('ngtx_item 1');
      const thirdInHtml = getAll('ngtx_item 2');

      // assert
      expect(firstInHtml.first().debugElement).toEqual(all[0]);
      expect(secondInHtml.first().debugElement).toEqual(all[1]);
      expect(thirdInHtml.first().debugElement).toEqual(all[2]);
    });

    it('should get elements by dynamic ngtx attribute', () => {
      // arrange
      const items = [
        { name: 'name 11' },
        { name: 'name 1' },
        { name: 'name 2' },
      ];
      component.dynamicItems = items;
      fixture.detectChanges();

      // act
      const all = fixture.debugElement.queryAll(
        By.css('[data-ngtx*="dynamic-item"]'),
      );
      const firstInHtml = getAll('ngtx_name 11');
      const secondInHtml = getAll('ngtx_name 1');
      const thirdInHtml = getAll('ngtx_name 2');

      // assert
      expect(firstInHtml.first().debugElement).toEqual(all[0]);
      expect(secondInHtml.first().debugElement).toEqual(all[1]);
      expect(thirdInHtml.first().debugElement).toEqual(all[2]);
    });

    it('should be chainable', () => {
      // arrange, act
      const spans = getAll(ListItemComponent).getAll('span');
      const unreachableFromChild = getAll(ListComponent)
        .getAll('span')
        .getAll(ListComponent); // cannot find from child
      const reachableFromRoot = getAll(ListComponent); // can find it from root

      // assert
      expect(spans.length).toBe(3);
      expect(unreachableFromChild).toBe(null);
      Expect.element(reachableFromRoot.first()).toBeComponent(ListComponent);
    });

    it('should return all matches of an array-query', () => {
      // arrange, act
      const result1 = getAll(['.item', ListItemComponent]);
      const result2 = getAll([ListItemComponent, '.item']);
      const result3 = getAll([NotExistingComponent, '.item']);
      const result4 = getAll(['.non-existing', ListItemComponent]);

      // assert
      expect(result1.length).toBe(4);
      Expect.element(result1.first()).toBeHtmlElement(HTMLDivElement);
      Expect.element(result1.last()).toBeComponent(ListItemComponent);

      expect(result2.length).toBe(4);
      Expect.element(result2.first()).toBeComponent(ListItemComponent);
      Expect.element(result2.last()).toBeHtmlElement(HTMLDivElement);

      expect(result3.length).toBe(1);
      Expect.element(result3.first()).toBeHtmlElement(HTMLDivElement);

      expect(result4.length).toBe(3);
      result4.forEach((result) =>
        Expect.element(result).toBeComponent(ListItemComponent),
      );
    });

    it('should return only unique queries of an array-query', () => {
      // arrange, act
      const result1 = getAll(['app-list-item', ListItemComponent]);
      const result2 = getAll(['app-list-item']);
      const result3 = getAll([ListItemComponent]);

      // assert
      expect(result1.length).toBe(3);
      expect(result2.length).toBe(result1.length);
      expect(result3.length).toBe(result1.length);
    });

    it('should return null if nothing matches', () => {
      // arrange, act, assert
      expect(getAll(['.not-existing', NotExistingComponent])).toBe(null);
    });
  }),
);
