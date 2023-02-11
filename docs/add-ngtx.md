[home]: ../README.md
[overview]: ./built-in.md
[examples]: ./examples.md
[getstarted]: ./ngtx.md
[extensionfns]: ./extending.md

# [🏠][home] &nbsp; → &nbsp; [Documentation][overview] &nbsp; → &nbsp; **Adding ngtx to Your Tests**

> Already knowing the base concepts of ngtx? No? [👉 Let's start here, first!][getstarted]

## Adding ngtx to your `describe`-block

You can add ngtx to your tests in four small steps. Initially, those steps may seem very complicated and even un-intuitive. But after doing this several times, it gets very easy to remember and do. We promise! 🙂

#### Step 1: Wrapping the Test-suite with a Call to ngtx

You are probably familiar with a standard test-suite like this:

```ts
describe('TextboxComponent', () => {
  let fixture: ComponentFixture<TextboxComponent>;
  let component: TextboxComponent;

  beforeEach(async () => {
    // skipping TestModule setup ...
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
```

To include ngtx just wrap the second argument of the `describe`block in a `ngtx`-call:

```diff
+ import { ngtx } from '@centigrade/ngtx';

- describe('TextboxComponent', () => {
+ describe('TextboxComponent', ngtx(() => {
    let fixture: ComponentFixture<TextboxComponent>;
    let component: TextboxComponent;

    beforeEach(() => {
      // skipping TestModule setup ...
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TextboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
- });
+ }));
```

#### Step 2: "Importing" the ngtx Helpers

Nice! The `ngtx`-function call will provide us with some helpers; we can grab them as the first argument of our test-suite function:

```diff
- describe('TextboxComponent', ngtx(() => {
+ describe('TextboxComponent', ngtx(( { useFixture, When, host, get } ) => {
    let fixture: ComponentFixture<TextboxComponent>;
    let component: TextboxComponent;

    beforeEach(() => {
      // skipping TestModule setup ...
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TextboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
}));
```

Cool, we just made the `useFixture`, `When` and `get`-helper, as well as the `host`-TargetRef available by "importing" them via the first argument.

#### Step 3: "Connecting" ngtx with your tests

But wait, what is that `useFixture` helper? In order to "connect" ngtx to your test-suite, you need to call this function by passing the Angular test-fixture to it, like so:

```diff
describe('TextboxComponent', ngtx(( { useFixture, When, host, get } ) => {
  let fixture: ComponentFixture<TextboxComponent>;
  let component: TextboxComponent;

  beforeEach(() => {
    // skipping TestModule setup ...
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxComponent);
    component = fixture.componentInstance;
-   fixture.detectChanges();
+   useFixture(fixture);
  });
}));
```

Once ngtx receives the fixture instance, it will trigger the change-detection for you; that's why you can remove the default change-detection call.

#### Step 4: Passing Type-Information to Improve Intellisense

Now, there's only one little detail to add, before actually adding the test.

For better intellisense, ngtx needs to know of what type the `host` / component under test is. That's why the `ngtx` is generic and accepts one type-constraint.
In our example the component under test is the `TextboxComponent`, so we add that information like so:

```diff
- describe('TextboxComponent', ngtx(( { When, host, get } ) => {
+ describe('TextboxComponent', ngtx<TextboxComponent>(( { When, host, get } ) => {
    let fixture: ComponentFixture<TextboxComponent>;
    let component: TextboxComponent;

    beforeEach(() => {
      // skipping TestModule setup ...
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(TextboxComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
}));
```

**🎉 Now we're finally ready to start declarative tests, like the one we already saw:**

```diff
- import { ngtx } from '@centigrade/ngtx';
+ import { ngtx, state, haveState } from '@centigrade/ngtx';

describe('TextboxComponent', ngtx<TextboxComponent>(( { When, host, get } ) => {
  let fixture: ComponentFixture<TextboxComponent>;
  let component: TextboxComponent;

  beforeEach(() => {
    // skipping TestModule setup ...
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
+
+ it('[the clear button] should clear the content of the textbox', () => {
+   When(host)
+     .has(state({ text: 'hi!' }))
+     .and(the.ClearButton)
+     .gets(clicked())
+     .expect(host)
+     .to(haveState({ text: '' }));
+ });
}));
```

> #### 💡 Built-in predicates and assertions can be imported
>
> Note: All the ngtx predicates and assertions can be simply imported from the library. See first line in the example above.

Done! You're ready to write additional tests now with all the help of ngtx!

### Next Steps

We recommend you to [👉 see some common examples][examples], to get you familiar with basic tests.
