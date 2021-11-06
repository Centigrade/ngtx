import { Component } from '@angular/core';
import { ngtx } from '../..';
import { Expect } from '../shared/expect';
import { configureTestModule } from '../shared/util';

@Component({
  template: `
    <h1 class="headline">Headline</h1>
    <h2 class="headline">Sub Headline</h2>

    <app-list>
      <app-list-item>Item 1</app-list-item>
      <app-list-item>Item 2</app-list-item>
      <app-list-item>
        <span>Item 3.1</span>
        <span>Item 3.2</span>
        <span>Item 3.3</span>
      </app-list-item>

      <div class="item">Some other type of item</div>
    </app-list>
  `,
})
class GetTestComponent {}

@Component({
  selector: 'app-list',
  template: '<section> <ng-content></ng-content> </section>',
})
class ListComponent {}

@Component({
  selector: 'app-list-item',
  template: '<div> <ng-content></ng-content> </div>',
})
class ListItemComponent {}

@Component({
  template: '',
})
class NotExistingComponent {}

describe(
  'Feature: NgtxElement.get',
  ngtx(({ useFixture, get }) => {
    configureTestModule(GetTestComponent, useFixture, {
      declarations: [ListComponent, ListItemComponent],
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
  }),
);

describe(
  'Feature: NgtxElement.getAll',
  ngtx(({ useFixture, getAll }) => {
    configureTestModule(GetTestComponent, useFixture, {
      declarations: [ListComponent, ListItemComponent],
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
      expect(result).toBeNull();
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
      expect(unreachableFromChild).toBeNull();
      Expect.element(reachableFromRoot.first()).toBeComponent(ListComponent);
    });
  }),
);
