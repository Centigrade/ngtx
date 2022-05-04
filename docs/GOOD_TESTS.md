## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **Writing Good Tests**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### First Steps
>
> Learn how to integrate ngtx into your test cases step by step. The [first steps page][firststeps] is the perfect starting point, when you never worked with ngtx before.
>
> ### Component Test Harnesses
>
> Understand what [Component Test Harnesses][harnesses] are and how you can utilize them to become more DRY in your tests.

---

</details>

&nbsp;

This article explains to you what we have learnt about testing Angular components. It's a recommendation which we draw from our experience; but it is probably not "the answer to everything" (which is 42 anyway). There may be situations where another approach is also perfectly fine.

> ### Any Ideas?
>
> We would love to hear how you are doing Angular testing! We can learn from it to further improve ngtx and make it (even) more useful to you.
>
> - What common problems / challenges do you have?
> - How do you currently handle these problems?
> - What do you think could ngtx improve in your tests?
> - Where does ngtx needs to be improved to suit your needs?
>
> Please create an issue telling us about the points above and how you would like to utilize ngtx.

## TL;DR

In order to write good, maintainable tests...

- use [Component Test Harnesses][harnesses] and
- use ngtx' declarative testing api

That's all you need to do :) If you like to learn more details, just read on. We are going to write our first tests from complete, default Angular tests to using declarative testing.

## Prerequisites

Before you continue with this article, you should have a basic understanding of ngtx' features and a good understanding of component-test harnesses.

If you're unsure about these topics, we recommend you to read these two articles before:

- [Basic knowledge about unit testing in Angular][unittests]
- [Basic knowledge about ngtx' features][firststeps]
- [A solid understanding of component test-harnesses][harnesses]

Everybody else should be good to go!

## What You will Learn

- Difference between imperative and declarative code
- Why declarative code is often better
- How to work with ngtx' declarative test api and component test harnesses

At the end of this article you will be able to write declarative tests with ngtx and test-component harnesses. You will also have a proper mental model of declarative test cases and a **basic** understanding of the inner workings.

## Starting from Scratch

In order to know where you want to go, you first need to understand where you come from. That's why our road-map looks like this:

1. introduction of the component to test
2. writing the tests the good old angular way
3. adding ngtx and component test harnesses to become more DRY
4. moving on to declarative test api to get rid of the remaining WET code

## A Simple Expander Component

For out test cases we use a simple expander component. We got the following specs from our designer:

- It has a header section with a customizable title
- The header section also contains arrow-icon showing the current open or collapsed state.
- Clicking the header section will toggle the expander's open
- When open the expander's content will be visible; otherwise it should be hidden

### The Component Code

So let's jump right in. To fulfill the requirements, we created the following simple expander component:

```html
<section class="header" (click)="toggle()">
  <span *ngIf="title">{{ title }}</span>
  <app-icon [name]="icon"></app-icon>
</section>

<section *ngIf="open" class="content">
  <ng-content></ng-content>
</section>
```

```ts
@Component({
  /* selector, templateUrl, ... */
})
export class ExpanderComponent {
  @Input() title?: string;
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  public icon = 'arrow-down';

  public toggle(): void {
    this.open = !this.open;
    this.openChange.emit(this.open);
    this.icon = this.open ? 'arrow-down' : 'arrow-up';
  }
}
```

Easy going. Now we're going to test our component to make sure it's working like we expect it to work. In the first step we will only use Angular's built-in testing features.

> Although we only use Angular testing-features for now, please note that we are using [jest][jest] as testing framework, to make our life just a little bit more comfortable.

Let's have a look on a very basic test suite, that only ensures that the `ExpanderComponent` can be created and rendered without runtime errors occurring:

```ts
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ExpanderComponent } from './expander.component';
import { IconComponent } from '../icon/icon.component';

describe('ExpanderComponent', () => {
  let fixture: ComponentFixture<ExpanderComponent>;
  let component: ExpanderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpanderComponent, IconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

In this testing suite we setup the Angular TestBed as usual and only check that the component could be build without any runtime errors. This initial, default test is also known as "smoke test". It simply ensures that there are not major, structural code problems.

Now we need to test the behavior of our expander component. Let's start testing the out expander component:

### Tests written with Angular built-in Functionality

```ts
describe('ExpanderComponent', () => {
  // skipping already shown code ...

  it('should not render the title span when no title was set', () => {
    // arrange, act
    component.title = undefined;
    fixture.detectChanges();
    // assert
    const titleSpan = fixture.debugElement.query(By.css('span'));
    expect(titleSpan).toBeFalsy(); // element not found
  });

  it('should render the correct title', () => {
    // arrange
    const expectedTitle = 'some title';
    // act
    component.title = expectedTitle;
    fixture.detectChanges();
    // assert
    const titleSpan = fixture.debugElement.query(By.css('span')).nativeElement;
    expect(titleSpan.textContent).toContain(expectedTitle);
  });

  it.each([
    { open: false, icon: 'arrow-down' },
    { open: true, icon: 'arrow-up' },
  ])('should have the "$icon"-icon when open is $open', ({ open, icon }) => {
    // arrange
    component.open = open;
    // act
    fixture.detectChanges();
    // assert
    const icon = fixture.debugElement.query(By.directive(IconComponent));
    expect(icon.name).toBe(icon);
  });

  it.each([false, true])(
    'should toggle the open state when clicking the header',
    (open) => {
      // arrange
      component.open = open;
      // act
      const header = fixture.debugElement.query(By.css('.header'));
      header.nativeElement.click();
      // assert
      expect(component.open).toBe(!open);
    },
  );
});
```

Although incomplete, it's already enough to analyze the tests and find out how we can improve them, to be more stable and readable. So let's have a closer look on these tests: In the **arrange** parts, we set up everything to have a proper starting situation. In the **act** part, we are doing some action that triggers a change, enabling us to check for some result in the **assert** part.

So far so good. But did you spot the duplicated code lines across the tests? There are typical occurrences of duplicated code in test cases, such as retrieving references to elements (`debugElement.query(...)`), or `fixture.detectChanges()` calls to apply the changes made in the **arrange** part of the test.

To improve the tests, let's add ngtx to our tests.

```diff
+ import { ngtx } from '@centigrade/ngtx';

- describe('ExpanderComponent', () => {
+ describe('ExpanderComponent', ngtx(({ useFixture }) => {
   beforeEach(async () => {
     // skipping unchanged code as seen in first code listing ...
   });

   beforeEach(() => {
     let fixture = TestBed.createComponent(ExpanderComponent);
     component = fixture.componentInstance;
-    fixture.detectChanges();
+    useFixture(fixture);
   });

   it('should create', () => {
     // ...
   });

   // ...
- });
+ }));
```

Without going into details, the code listing above shows how to initialize ngtx for usage in your test cases.

> If you need more information on setting up ngtx, please refer to the [ngtx: first steps page][firststeps].

After passing the `fixture` to ngtx via the "imported" `useFixture` helper, ngtx is ready to help you with testing. In the next code listing we will rewrite our tests and utilize component test-harnesses to get more DRY:

```diff
- describe('ExpanderComponent', ngtx(({ useFixture }) => {
+ describe('ExpanderComponent', ngtx(({ useFixture, get, detectChanges }) => {
  // skipping already shown code ...

+ // this is our component testing harness,
+ // we'll use it later inside the tests:
+ class Get {
+   static Header() {
+     return get('.header');
+   }
+   static Title() {
+     return get('span');
+   }
+   static Icon() {
+     return get(IconComponent);
+   }
+ }

  it('should not render the title span when no title was set', () => {
    // arrange, act
    component.title = undefined;
-   fixture.detectChanges();
+   detectChanges();
    // assert
-   const titleSpan = fixture.debugElement.query(By.css('span'));
+   const titleSpan = Get.Title();
    expect(titleSpan).toBeFalsy(); // element not found
  });

  it('should render the correct title', () => {
    // arrange
    const expectedTitle = 'some title';
    // act
    component.title = expectedTitle;
-   fixture.detectChanges();
+   detectChanges();
    // assert
-   const titleSpan = fixture.debugElement.query(By.css('span'));
+   const titleSpan = Get.Title();
    expect(titleSpan.textContent).toContain(expectedTitle);
  });

  it.each([
    { open: false, icon: 'arrow-down' },
    { open: true, icon: 'arrow-up' },
  ])('should have the "$icon"-icon when open is $open', ({ open, icon }) => {
    // arrange
    component.open = open;
    // act
-   fixture.detectChanges();
+   detectChanges();
    // assert
-   const icon = fixture.debugElement.query(By.directive(IconComponent));
+   const icon = Get.Icon();
    expect(icon.name).toBe(icon);
  });

  it.each([false, true])(
    'should toggle the open state when clicking the header',
    (open) => {
      // arrange
      component.open = open;
      // act
-     const header = fixture.debugElement.query(By.css('.header'));
-     header.nativeElement.click();
+     Get.Icon().nativeElement.click();
      // assert
      expect(component.open).toBe(!open);
    },
  );
}));
```

It's already a bit better. We eliminated the repeating code lines getting us references to some parts of our expander's template and replaced them with calls to our component-testing-harness class. Whenever the HTML of the expander gets restructured, we now just need to change the testing harness class. The tests theirselves can stay exactly the same. This automatically brings you more robust tests.

Also we saved some keystrokes by using ngtx' `detectChanges` helper. It's not a huge difference, but it removes some unnecessary noise from our tests, which is great.

### There's more to improve ...

Currently the tests are written in an imperative coding style. You need to write quite some boilerplate to get the testing state right, then trigger some stuff and then expecting something to have happened.

The problem with this is, that you cannot read the tests as a story. You cannot simply scan over one test and parse its intention right away. You need to read, think and figure out what behavior is actually tested. Also remember: The tests we have seen so far are one of the easier examples. Usual tests contain:

- setting initial state
- triggering some event
- expecting something to happen

Written in imperative style, this will quickly bloat your test. So how to fix it?

### Using ngtx' Declarative Testing API

Let's have a look on how to utilize ngtx to move from imperative, repeating code to pretty DRY and extremely readable code:

```diff
- describe('ExpanderComponent', ngtx(({ useFixture, get, detectChanges }) => {
+ describe('ExpanderComponent', ngtx<ExpanderComponent>(
+  ({ useFixture, get, When, host }) => {
    // skipping already shown code ...

    class Get {
      static Header() {
        return get('.header');
      }
      static Title() {
        return get('span');
      }
      static Icon() {
        return get(IconComponent);
      }
    }

    it('should not render the title span when no title was set', () => {
-     // arrange, act
-     component.title = undefined;
-     detectChanges();
-     // assert
-     const titleSpan = Get.Title();
-     expect(titleSpan).toBeFalsy(); // element not found
+     When(host)
+       .hasState({ title: undefined })
+       .expect(Get.Title)
+       .toBeMissing(); // element not found
    });

    it('should render the correct title', () => {
-     // arrange
-     const expectedTitle = 'some title';
-     // act
-     component.title = expectedTitle;
-     detectChanges();
-     // assert
-     const titleSpan = Get.Title();
-     expect(titleSpan.textContent).toContain(expectedTitle);
+     const expectedTitle = 'some title';
+     When(host)
+       .hasState({ title: expectedTitle })
+       .expect(Get.Title)
+       .toContainText(expectedTitle);
    });

    it.each([
      { open: false, icon: 'arrow-down' },
      { open: true, icon: 'arrow-up' },
    ])('should have the "$icon"-icon when open is $open', ({ open, icon }) => {
-     // arrange
-     component.open = open;
-     // act
-     detectChanges();
-     // assert
-     const icon = Get.Icon();
-     expect(icon.name).toBe(icon);
+     When(host)
+       .hasState({ open: open })
+       .expect(Get.Icon)
+       .toHaveState({ name: icon });
    });

    it.each([false, true])(
      'should toggle the open state when clicking the header',
      (open) => {
-       // arrange
-       component.open = open;
-       // act
-       const header = fixture.debugElement.query(By.css('.header'));
-       Get.Icon().nativeElement.click();
-       // assert
-       expect(component.open).toBe(!open);
+       When(host)
+         .hasState({ open: open })
+         // please note: "then" function imported from '@centigrade/ngtx' package
+         .and(then(Get.Icon).emits("click"))
+         .expect(host)
+         .toHaveState({ open: !open });
    }),
}));
```

That's much better. Now every test reads just like a short story! There is not much to think about, it's simple and clear.

[api]: ./DOCUMENTATION.md
[harnesses]: ./HARNESSES.md
[firststeps]: ./FIRST_STEPS.md
[home]: ../README.md
[jest]: https://jestjs.io/
[unittests]: https://angular.io/guide/testing
