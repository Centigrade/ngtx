import { Component, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ngtx } from '../..';
import { NgtxElement } from '../../entities';

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

class Expect {
  static element(ngtxElement: NgtxElement) {
    return class {
      static toBeHtmlElement(type: typeof HTMLElement): void {
        expect(ngtxElement).toBeDefined();
        expect(ngtxElement).toBeInstanceOf(NgtxElement);
        expect(ngtxElement.nativeElement).toBeInstanceOf(type);
      }
      static toBeComponent(type: Type<any>): void {
        expect(ngtxElement).toBeDefined();
        expect(ngtxElement).toBeInstanceOf(NgtxElement);
        expect(ngtxElement.component).toBeInstanceOf(type);
      }
    };
  }
}

describe(
  'Feature: NgtxElement.get',
  ngtx(({ useFixture, get }) => {
    let fixture: ComponentFixture<GetTestComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [GetTestComponent, ListComponent, ListItemComponent],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(GetTestComponent);
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
    let fixture: ComponentFixture<GetTestComponent>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [GetTestComponent, ListComponent, ListItemComponent],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(GetTestComponent);
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
