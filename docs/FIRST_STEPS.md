## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **First Steps**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### ngtx Examples
>
> If you feel like this article is too basic for you, feel free to skip sections in order to move along quicker. Alternatively refer to the [API documentation][api] and/or the [ngtx examples page][examples]. The given examples should be quite self-explaining for developers that already have experience with writing Angular tests.
>
> ### Feature Overview
>
> You may want to visit our [feature overview page][features] to quickly explore what ngtx can do for you.

---

</details>

&nbsp;

This article will guide you through the steps needed to write your test cases with ngtx. **It is meant to also serve beginners** which is why we will make one step at a time, avoiding to rush.

However readers of this article **are expected to have some experience with testing frameworks like [Jasmine][jasmine] or [Jest][jest].** If you lack this knowledge we strongly recommend you to get this knowledge first, before continuing.

Don't worry, it might look confusing the first time you see it, but once you have done these steps a few times you will very quickly get used to it, so bear with us.

## 1. Create a new Angular Project

> **Please Note:** You can skip this if you already have an Angular project.
>
> **Please Note:** You need to have the [@angular/cli](https://angular.io/cli) package installed globally.

You can create a new Angular app by running the angular cli via the following command in a terminal:

```sh
ng new <app-name>
```

instead of `<app-name>` of course use an app name you like, e.g. `my-angular-app` or similar.

## 2. Adding ngtx to your Angular Project

The first step is to add `@Centigrade/ngtx` to your dev-dependencies. To do this open a terminal in the root directory of your angular workspace and enter:

```sh
npm install @Centigrade/ngtx --save-dev
```

or using yarn:

```sh
yarn add @Centigrade/ngtx --dev
```

## 3. Open a Component Test File

Once ngtx is added to your project, you can actually start using it. Let's say you want to improve the default, in the first step generated `app.component.spec.ts` tests using ngtx. Initially the tests should look somewhat like this:

### Initial Tests generated by the `ng new` Command

```ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have 'my-angular-app' as title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-angular-app');
  });

  it('should render the title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'my-angular-app is running!',
    );
  });
});
```

### Adding ngtx to this Test-Suite

To use ngtx you will need to do four simple things:

1. Import ngtx into your test file,
2. Wrap the test suite with ngtx,
3. Add the ngtx helpers as parameter to your test-suite,
4. Pass the test fixture to ngtx with the `useFixture` helper.

**Let's have a look on first two points for now:**

```diff
// step 1: add the ngtx import
+ import { ngtx } from '@Centigrade/ngtx';

// step 2: Wrap the test suite with a function call
- describe('AppComponent', () => {
+ describe('AppComponent', ngtx(() => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  });

  // skipped rest of test suite contents...

// still step 2: don't forget the ending ")" when wrapping the suite:
- });
+ }));
```

At this stage we are nearly finished. By passing the test-suite (the function) to ngtx (see step 2), ngtx is able to "inject" its functionality into your test-suite as a parameter. In order to use it, just add a parameter to your test-suite function, which will then automatically be provided by ngtx. This parameter contains all helper-functionality that ngtx offers:

```diff
import { ngtx } from '@Centigrade/ngtx';

// step 3: Add the ngtx helpers as parameter to your test-suite
- describe('AppComponent', ngtx(() => {
+ describe('AppComponent', ngtx((ngtxHelpers) => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    // step 4: initialize ngtx by passing the fixture to it:
+    ngtxHelpers.useFixture(fixture);

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // skipped rest of test suite contents...
}));
```

> **Please Note:** After we applied all these changes, the tests look quite messy, not DRY at all and in general quite verbose. Don't worry as we will fix a lot of this at a later stage.

**After passing the test fixture to ngtx** via its `useFixture` helper, all ngtx helpers are ready to be used.

> ### When you forget to pass the fixture
>
> ngtx will throw an error with the message **"[ngtx] No fixture was passed via "useFixture" helper, or the test-fixture failed to build."** if you forget to provide the fixture via `useFixture(fixture)`. So this step is crucial.

> ### **Pro Tip!**
>
> ngtx is even better when you use it together with [object destructuring][wiki.destructuring]! This will make the `ngtxHelper.` prefix unnecessary and shortcuts the accessibility of the ngtx functionality:
>
> ```diff
> - describe('AppComponent', ngtx((ngtxHelpers) => {
> + describe('AppComponent', ngtx(({ useFixture, /* other helpers ... */ }) => {
>   // skipping beforeEach part ...
>
>   it('should create the app', () => {
>      const fixture = TestBed.createComponent(AppComponent);
> -    ngtxHelper.useFixture(fixture);
> +    useFixture(fixture);
>   });
>
>   // skipping rest ...
> ```

## Moving on: Improving the Tests by Getting DRY

Before having a look on how we could improve the test-cases using ngtx, we will first do a bit of refactoring, in order to become more **[DRY][wiki.dry]**.

You might have noticed it as well: We are recreating the app fixture and app constant in each test-case over and over again (`const fixture = TestBed.createComponent(...); ...`). This isn't very elegant nor readable. It's just noise distracting from what really happens in that test. So let's get rid of it:

```diff
- import { TestBed } from '@angular/core/testing';
+ import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ngtx } from '@Centigrade/ngtx';

describe('AppComponent', ngtx(({ useFixture }) => {
+ let fixture: ComponentFixture<AppComponent>;
+ let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  });

+ beforeEach(() => {
+   fixture = TestBed.createComponent(AppComponent);
+   app = fixture.componentInstance;
+   // passing fixture to ngtx:
+   useFixture(fixture);
+ });

  it('should create the app', () => {
-    const fixture = TestBed.createComponent(AppComponent);
-    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have 'my-angular-app' as title`, () => {
-    const fixture = TestBed.createComponent(AppComponent);
-    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-angular-app');
  });

  it('should render the title', () => {
-    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'my-angular-app is running!',
    );
  });
}));
```

Ah - much better. With this in place, we can finally start using the first ngtx helper in order to improve the default tests and become even more readable.

## Improving the Test Cases with the `get`-Helper

In order to use ngtx' `get` helper, we add a declaration for it in the ngtx wrapper-call (commented as "step 1" in code snippet beneath). After this, we're ready to use the `get` function in the test case.

The `get` helper returns a `NgtxElement` instance, which provides additional functionality so we can improve the readability of the test with it:

```diff
// step 1: add the "get" helper to the ngtx wrapper-call:
- describe('AppComponent', ngtx(({ useFixture }) => {
+ describe('AppComponent', ngtx(({ useFixture, get }) => {

  // ...

  it('should render the title', () => {
    // step 2: using the get helper being declared in the ngtx wrapper-call:
-   const compiled = fixture.nativeElement as HTMLElement;
-   expect(compiled.querySelector('.content span')?.textContent).toContain(
-    'my-angular-app is running!',
-   );
+   const title = get('.content span').textContent();
+   expect(title).toContain('my-angular-app is running!');
  });
}));
```

> ### Do you want more details on `get` and other helpers?
>
> We will not go into details about all the features `get` provides. If you are interested in this kind of information, please refer to the [API documentation][api] or the [examples page][examples].

Congratulations, you successfully set up ngtx and used its `get` helper functionality in a test-case to improve its readability!

## Summary

In order to add ngtx to your Angular project, you need to do following steps:

1. install ngtx via `npm install @Centigrade/ngtx --save-dev`
2. import ngtx to your test file `import { ngtx } from '@Centigrade/ngtx'`
3. wrap your test-suite inside a `ngtx(...)` wrapper-call
4. declare the ngtx helpers you want to use in your tests
5. pass your test `fixture` to via `useFixture(fixture)` in a `beforeEach` hook
6. use the helpers throughout your test-cases 👍

## Advanced and more Real-world Testing with ngtx

By now, it might look like ngtx is not actually adding a huge value to your tests, but there is (quite a bit) more to ngtx than just the `get` helper and its friends.

This example was chosen, because it is a good starting point to give you a very basic understanding of how to introduce ngtx into your Angular test cases. If you want to know how to use ngtx to its full potential, you might want to take a look on these more advanced topics:

- [Examples][examples]: Presenting a range of ngtx helpers and how they are used.
- [How to write better tests with ngtx][good-tests]

<!-- Links -->

[api]: ./DOCUMENTATION.md
[examples]: ./EXAMPLES.md
[good-tests]: ./GOOD_TESTS.md
[home]: ../README.md
[jasmine]: https://jasmine.github.io/
[jest]: https://jestjs.io/
[wiki.dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[wiki.destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring