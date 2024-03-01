[home]: ../README.md
[docs]: ./overview.md
[extending]: ./extending.md
[havecalled]: ./assertions/have-called.md
[querying]: ./querying.md
[setup]: ./add-ngtx.md

## [🏠][home] &nbsp; → &nbsp; [Documentation][docs] &nbsp; → &nbsp; **Common Examples**

## Examples By Use Case

This article demonstrates common test scenarios, and how declarative testing with ngtx can solve them for you.

> ⚠️ The examples do not show the setup code for the describe block, which is needed to get the reference to the `When`-function.
> Refer to [this guide][setup] in order to learn how to setup ngtx in your tests.

#### Checking the Existence / Non-Existence of a Target

Template of host

```html
<section *ngIf="loggedInUser" class="greeting">
  <span> Hi {{ loggedInUser.name }}! </span>
</section>
```

Declarative tests

```ts
import { beMissing, beFound, state } from '@centigrade/ngtx';

class the {
  static Greeting() {
    return get('.greeting');
  }
}

it('should show no greeting for guests', () => {
  When(host)
    .has(state({ loggedInUser: undefined }))
    .expect(the.Greeting)
    .to(beMissing());
});

it('should greet logged in users', () => {
  When(host)
    .has(state({ loggedInUser: { name: 'Ann' } }))
    .expect(the.Greeting)
    .to(beFound());
});
```

#### Checking the text-content of a Target

Template of host

```html
<section class="greeting">
  <span> Hi {{ loggedInUser.name }}! </span>
</section>
```

Declarative tests

```ts
import { containText, haveText, state } from '@centigrade/ngtx';

class the {
  static Greeting() {
    return get('.greeting');
  }
}

it('should show a greeting for logged in users', () => {
  When(host)
    .has(state({ loggedInUser: { name: 'Ann' } }))
    .expect(the.Greeting)
    .to(containText('Ann'));
});

// or alternatively, more precise:
it('should show a greeting for logged in users', () => {
  When(host)
    .has(state({ loggedInUser: { name: 'Ann' } }))
    .expect(the.Greeting)
    .to(haveText('Hi Ann!'));
});
```

#### Provoke an Event and Check that a Service has been Called

Template of host

```html
<section *ngIf="loggedInUser" class="greeting">
  <button (click)="authService.logout()">Logout</button>
</section>
```

Declarative tests

```ts
import { clicked, haveCalled, injected, state } from '@centigrade/ngtx';

class the {
  static LogoutButton() {
    return get('button');
  }
}

it('should logout a user when clicking the logout-button', () => {
  When(host)
    .has(state({ loggedInUser: { name: 'Ann' } }))
    .and(the.LogoutButton)
    .gets(clicked())
    .expect(host)
    .to(
      // hint: "injected" can be imported from @centigrade/ngtx
      haveCalled(injected(AuthService), 'logout', {
        times: 1, // 1 is actually default, showing it for demonstration
        withArgs: [], // expect no arguments on call
        whichReturns: Promise.resolve(), // pass a spy-return-value
      }),
    );
});
```

More information `haveCalled` can be found [here][havecalled].

#### Check that a Method has been Called on a NativeElement

Template of host

```html
<input #textbox [value]="text" />
<button (click)="clearAndFocusTextbox(textbox)">X</button>
```

Declarative tests

```ts
import { clicked, haveCalled, nativeMethod } from '@centigrade/ngtx';

class the {
  static ClearButton() {
    return get('button');
  }
  static NativeInput() {
    return get('input');
  }
}

it('should focus the textbox on button clear-click', () => {
  When(the.ClearButton)
    .gets(clicked())
    .expect(the.NativeInput)
    .to(
      haveCalled(nativeMethod, 'focus', {
        times: 1, // 1 is actually default, but showing for educational purposes
      }),
    );
});
```

#### Detect Changes on a `ChangeDetectionStrategy.OnPush` Component

Template of host

```html
<span>Hi {{ name }}!</span>
```

Declarative tests

```ts
import { state, detectChanges, haveText } from '@centigrade/ngtx';

class the {
  static NameSpan() {
    return get('span');
  }
}

it('should render a greeting', () => {
  When(host)
    .has(state({ name: 'Ann' }))
    // hint: this will enforce change detection for OnPush components
    .and(detectChanges({ viaChangeDetectorRef: true }))
    .expect(the.NameSpan)
    .to(haveText('Hi Ann!'));
});
```

#### Trigger a Method Call

Template of host

```html
<span>Hi {{ fullName }}!</span>
```

Declarative tests

```ts
import { state, call, componentMethod, haveText } from '@centigrade/ngtx';

class the {
  static FullNameSpan() {
    return get('span');
  }
}

it('should update the full name when the first name changed', () => {
  When(host)
    .has(state({ firstName: 'Ann', lastName: 'Smith' }))
    .and(call(componentMethod, 'ngOnChanges', { firstName: true }))
    .expect(the.FullNameSpan)
    .to(haveText('Hi Ann Smith!'));
});
```

## Complete Examples

### Example: CartView

The following example contains a custom predicate extension. If you like to better understand how this is working you can take a look here: [How to: writing custom extensions][extending].

```ts
import {
  allOrNth,
  clicked,
  containText,
  createExtensionFn,
  haveEmitted,
  ngtx,
  state,
} from '@centigrade/ngtx';

describe(
  'CartViewComponent',
  ngtx<CartViewComponent>(({ useFixture, When, host, get, getAll }) => {
    let component: CartViewComponent;
    let fixture: ComponentFixture<CartViewComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [
          CartViewComponent,
          CartItemComponent,
          LoadingSpinnerComponent,
        ],
        providers: [CartService],
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(CartViewComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    class the {
      // hint: allOrNth ("all or n-th") provides an API to get either all of the specified targets, or a specific one:
      static CartItems = allOrNth(CartItemComponent, getAll);
      static TotalSum() {
        return get<HTMLSpanElement>('.total-sum');
      }
    }

    it('should render a loading spinner when CartService.items is yet undefined', () => {
      When(host)
        // see at the very end of example, providerWithState is a custom predicate:
        .has(providerWithState(CartService, { items: undefined }))
        .expect(the.LoadingSpinner)
        .to(beFound());
    });

    it('should render all cart items', () => {
      const items = [
        { name: 'Chocolate' },
        { name: 'Ice Cream' },
        { name: 'Pizza' },
      ];

      When(host)
        // see at the very end of example, providerWithState is a custom predicate:
        .has(providerWithState(CartService, { items }))
        .expect(the.CartItems)
        .to(beFound({ times: items.length }));
    });

    it('should show the correct total sum in €', () => {
      const items = [{ price: 1 }, { price: 2 }, { price: 3 }];

      When(host)
        // see at the very end of example, providerWithState is a custom predicate:
        .has(providerWithState(CartService, { items }))
        .expect(the.TotalSum)
        .to(containText('6,00€'));
    });
  }),
);

// --------------------  ❗️   ---------------------
// to understand the following code, please follow
// the link to the documentation of "how to write
// custom extension functions" given in the paragraph
// above this code example.
// -------------------------------------------------

// Custom predicates:

// hint: type "Type<...>" is imported from @angular/core:
const providerWithState = <Provider>(
  provider: Type<Provider>,
  stateDef: Partial<Provider>,
) =>
  createExtensionFn((getTargets, { addPredicate }, fixture) => {
    addPredicate(() => {
      // hint: ngtx supports manipulation of multiple targets,
      // so per default it is passing arrays:
      getTargets().forEach((target) => {
        const providerInstance = target.injector.get(provider);

        Object.entries(stateDef).forEach(([property, overrideValue]) => {
          (providerInstance as any)[property] = overrideValue;
        });
      });

      // hint: since the manipulation of the service
      // possibly requires a view update, we trigger
      // change detection afterwards:
      fixture.detectChanges();
    });
  });
```

### Next Steps

In the examples above, you have seen the usage of ngtx' `get` and `getAll` helpers. As this is probably new to you, we recommend you to [👉 read about how to query with ngtx][querying].
