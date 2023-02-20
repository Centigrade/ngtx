[docs]: ./ngtx.md
[home]: ../README.md

## [🏠][home] &nbsp; → &nbsp; [Documentation][docs] &nbsp; → &nbsp;**Custom Extension-Functions**

&nbsp;

> #### 💡 New to ngtx?
>
> If you're new to ngtx and don't know the basic concepts yet, better
> [start here first][docs]!

## Extending ngtx' Declarative Api

ngtx comes with several neat `predicates` and `assertions` but there will probably be (quite a lot of) cases where you need to add custom logic in order to make your test suit fit your needs. ngtx' api is designed with extendability in mind. Let's jump it.

### Custom Assertions: Expander-Example

Imagine we have a `ExpanderComponent` with an arrow-icon inside. Whenever the expander is opened, the arrow-icon should get a style-css property "`transform: rotate(180deg)`". However, if the expander is closed the transform gets reset to zero.

You created this component and it works great:

```html
<section class="title">
  <app-icon
    name="arrow-down"
    [style.transform]="opened ? 'rotate(180deg)' : 'rotate(0deg)'"
  ></app-icon>
</section>

<section *ngIf="opened" class="contents">
  <ng-content></ng-content>
</section>
```

> ### The Result
>
> ![Picture of the expander in collapsed state](./media/expander_collapsed.svg)
>
> Clicking it will expand the expander and rotate the arrow icon:
>
> ![Picture of the expander in opened state](./media/expander_opened.svg)

Now we want to test the rotation behavior of the arrow. After looking into the built-in assertions list, we realize - ngtx does not provide a way to assert styles being applied to an element. Bummer!

But fortunately, we can help ourselves. We just need to create a custom assertion. Let's start with the _vision_ of our extension - how do we want to use it later? What about this:

```ts
it('should rotate the arrow icon when opened', () => {
  // hint: host = component under test = ExpanderComponent
  When(host)
    .has(state({ opened: true }))
    .expect(the.ArrowIcon)
    // here we use our desired extension, that we are going to build:
    .to(haveStyle('transform', 'rotate(180deg)'));
});
```

Looks great! Now let's implement it; we start with defining the extension function's name and parameter list:

```ts
export const haveStyle = (styleProp: string, expectedValue: string) => {};
```

That's easy. Next we create the implementation. In order to do this we need to use ngtx' `createExtension`-function. This function takes a function and marks it as extension for ngtx. There is a reason for that, but let's not bother for now:

```ts
import { createExtension } from '@centigrade/ngtx';

export const haveStyle = (styleProp: string, expectedValue: string) => {
  return createExtension(() => {
    // yet to come ...
  });
};
```

The `createExtension`-function hands us some tools and information about the current test, that we can use to inject our logic. To use them we just declare them on our argument list:

```ts
import { createExtension } from '@centigrade/ngtx';

export const haveStyle = (styleProp: string, expectedValue: string) => {
  return createExtension(
    (getTargets, { addAssertion, isAssertionNegated }, fixture) => {
      // yet to come ...
    },
  );
};
```

Let's go through the arguments that we are provided with by `createExtension`:

- `getTargets`: When calling this function, we get an array-like list of the _targets_ that is defined by the user in the test:

`... .expect(host).to(haveStyle(...))`: in this example calling `getTargets` will return us a list with only the resolved `host` reference in it. The resolved reference is of type `NgtxElement` a small wrapper around Angular's built-in `DebugElement`. It provides some extra features, but we're not taking a close look to them right now.

- `addAssertion`: this helper allows you to schedule assertion-logic to the current test. Your assertion-logic will be called at the end of the test, after all predicates have been executed.

- `isAssertionNegated`: this bool-flag tells you whether the user called `.not` ahead of your assertion, e.g. `... .expect(host).not.to(haveStyle(...))`. This way you can react to the negation and adapt your assertion-logic as needed.

- `fixture`: this is a reference to the `NgtxFixture`. Again, this type is a small wrapper around Angular's built-in `ComponentFixture`. It also adds some extra functionality and we also will ignore the details for now.

Now that we know about all the arguments we are given, we can finally use them to add our assertion-logic:

```ts
import { createExtension } from '@centigrade/ngtx';

export const haveStyle = (styleProp: string, expectedValue: string) => {
  return createExtension(
    (getTargets, { addAssertion, isAssertionNegated }, fixture) => {
      // step 1: pass ngtx our assertion function:
      addAssertion(() => {
        // step 2: get all targets to run our assertion-logic on:
        const targets = getTargets();

        // step 3: run the assertion-logic on every target:
        targets.forEach((target) => {
          // retrieve the HTMLElement's style object:
          const styles = target.nativeElement.styles;
          // check if the defined style-property has the expected value:
          // "styleProp" and "expectedValue" comes from our defined parameters (line 3)
          const actualValue = styles[styleProp];
          expect(actualValue).toEqual(expectedValue);
        });
      });
    },
  );
};
```

Cool! But wait. We ignore the fact, that `isAssertionNegated` could be true. In this case, we need to alter our logic a bit. Let's quickly fix that:

```ts
import { createExtension } from '@centigrade/ngtx';

export const haveStyle = (styleProp: string, expectedValue: string) => {
  return createExtension(
    (getTargets, { addAssertion, isAssertionNegated }, fixture) => {
      addAssertion(() => {
        const targets = getTargets();

        targets.forEach((target) => {
          const styles = target.nativeElement.styles;
          const actualValue = styles[styleProp];

          // fix: check for isAssertionNegated and adapt logic:
          if (isAssertionNegated) {
            expect(actualValue).not.toEqual(expectedValue);
          } else {
            expect(actualValue).toEqual(expectedValue);
          }
        });
      });
    },
  );
};
```

That's it! With this extension written, we can actually use it in our test as we drafted out earlier:

```ts
import { haveStyle } from './my-ngtx-extensions';

// ...
it('should rotate the arrow icon when opened', () => {
  When(host)
    .has(state({ opened: true }))
    .expect(the.ArrowIcon)
    .to(haveStyle('transform', 'rotate(180deg)'));
});
```

and we can even use it with `.not`:

```ts
import { haveStyle } from './my-ngtx-extensions';

// ...
it('should rotate the arrow icon when opened', () => {
  When(host)
    .has(state({ opened: false }))
    .expect(the.ArrowIcon)
    .not.to(haveStyle('transform', 'rotate(180deg)'));
});
```

<!-- TODO: also explain how to use type-constraints to make extensions available for a specific TargetRef-type -->
