# First Steps with ngtx

This article will guide you through the steps needed to write your test cases with ngtx. **It is meant to also serve beginners** which is why we will make one step at a time, avoiding to rush.

However readers of this article **are expected to have some experience with testing frameworks like [Jasmine][jasmine] or [Jest][jest].** If you lack this knowledge we strongly recommend you to get this knowledge first, before continuing.

Don't worry, it might look confusing the first time you see it, but once you have done these steps a few times you will very quickly get used to it, so bear with us.

> ### Not a beginner?
>
> If you feel like this article is too basic for you, feel free to skip sections in order to move along quicker. Alternatively refer to the [API documentation][api] and/or the [ngtx examples page][examples]. The given examples should be pretty self-explaining for developers that already have experience with writing Angular tests.

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

  it(`should have as title 'my-angular-app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-angular-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'my-angular-app app is running!',
    );
  });
});
```

To use ngtx you will need to do four simple things:

1. Import ngtx into your test file,
2. Wrap the test suite with ngtx,
3. Add the ngtx helpers as parameter to your test-suite,
4. Pass the test fixture to ngtx with the `useFixture` helper.

Although we added four points to our todo list, **let's go with the first two points for now**:

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

At this stage we are nearly finished. By passing the test-suite to ngtx (see step 2), ngtx is able to "inject" its functionality into your test-suite as a parameter. In order to use it, just add a parameter to your test-suite, which will hold all ngtx related helpers for you:

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

> **Please Note:** After we applied all these changes, the tests look very wild, not DRY at all and in general quite verbose. Don't worry we will fix a lot of this at a later stage.

**After passing the test fixture to ngtx** via its `useFixture` helper, ngtx is ready to help you with its functionality. Please note that it will throw an error if you forget to provide the fixture to ngtx - so this step is crucial.

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

## 4. Adding the Helpers You Need

Since we're destructured the `ngtxHelpers`, we now weed to declare which helpers we wish to use throughout our test cases.

```diff
- describe('AppComponent', ngtx((ngtxHelpers) = {
+ describe('AppComponent', ngtx(({ useFixture, /* other helpers ... */ }) = {
  // skipping beforeEach part ...

  it('should create the app', () = {
     const fixture = TestBed.createComponent(AppComponent);
-    ngtxHelper.useFixture(fixture);
+    useFixture(fixture);
  });

  // skipping rest ...
```

### Moving on: Improving the Tests Using ngtx

Before having a look on how we could improve the test-cases using ngtx, we will first do a bit of refactoring, in order to become more **[DRY](wiki.dry)**:

```diff
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ngtx } from '@Centigrade/ngtx';

describe('AppComponent', ngtx(() => {
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

  it(`should have as title 'my-angular-app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-angular-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'my-angular-app app is running!',
    );
  });
}));
```

<!-- Links -->

[api]: ./DOCUMENTATION.md
[examples]: ./EXAMPLES.md
[jasmine]: https://jasmine.github.io/
[jest]: https://jestjs.io/
[wiki.dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[wiki.destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring
