[home]: ../README.md
[overview]: ./built-in.md
[examples]: ./examples.md
[getstarted]: ./ngtx.md
[extensionfns]: ./extending.md

# [🏠][home] &nbsp; → &nbsp; [Documentation][overview] &nbsp; → &nbsp; **Adding ngtx to Your Tests**

In this article you'll learn how to add ngtx to your test-cases.

> Not knowing the base concepts of ngtx? [👉 Let's start here!][getstarted]

## Adding ngtx to your Test suites

You can add ngtx to your tests in four small steps. Initially, those steps may seem a bit complicated or even unintuitive. But after doing this several times, it gets very easy to remember and do. We promise! 😉

#### Step 1: Wrapping the Test suite with a Call to ngtx

You are probably familiar with a standard Angular test-setup like the following:

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

To include ngtx, just wrap the callback of the `describe`-block in a `ngtx`-call:

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

The `ngtx`-function call will provide us with some helpers, that we can grab from the first argument of our test suite function:

```diff
import { ngtx } from '@centigrade/ngtx';

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

We just made the `useFixture`, `When` and `get`-helpers, as well as the `host`-TargetRef available by "importing" them via the first argument.

#### Step 3: "Connecting" ngtx with your tests

But wait, what is that `useFixture` helper? In order to "connect" ngtx to your test suite, you need to call this function by passing the Angular test-fixture to it, like so:

```diff
import { ngtx } from '@centigrade/ngtx';

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

Once ngtx receives the fixture instance, it will trigger the change-detection for you – that's why you can remove the default change-detection call.

#### Step 4: Passing Type Information to Improve Intellisense

Now, there's only one small detail missing before we can actually add our tests.

For better intellisense, ngtx needs to know of what type the `host` / component under test is. That's why the `ngtx`-function is generic and accepts one type-constraint. In our example, the component under test is the `TextboxComponent`. We can pass that information to ngtx like so:

```diff
import { ngtx } from '@centigrade/ngtx';

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
      useFixture(fixture);
    });
}));
```

**🎉 Now we're finally ready to start declarative tests, like the one we already saw:**

```diff
- import { ngtx } from '@centigrade/ngtx';
+ import { ngtx, state, clicked, haveState } from '@centigrade/ngtx';

describe('TextboxComponent', ngtx<TextboxComponent>(( { When, host, get } ) => {
  let fixture: ComponentFixture<TextboxComponent>;
  let component: TextboxComponent;

  beforeEach(() => {
    // skipping TestModule setup ...
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxComponent);
    component = fixture.componentInstance;
    useFixture(fixture);
  });

+ class the {
     // the following function is a TargetRef function; we wrap them in a class
     // to list all of the targets we will use throughout our tests in one place.
     // the name of the class ("the") seems unusual but reads well in the test
     // sentences; we will see that in the test case below.
+    static ClearButton() {
+      return get('button.clear');
+    }
+ }
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
> Note: All the ngtx predicates and assertions can be simply imported from the library. See very first line in the example above.

Done! Now you're all set to write your tests declaratively using ngtx!

### Next Steps

We recommend you to [👉 see some common examples][examples], to get familiar with basic tests.
