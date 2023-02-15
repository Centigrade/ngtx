[home]: ../README.md
[docs]: ./overview.md

## [🏠][home] &nbsp; → &nbsp; [Documentation][docs] &nbsp; → &nbsp; **Common Examples**

## Examples By Use-Case

This article demonstrates common test-scenarios, and how declarative testing with ngtx can solve them for you.

#### Checking the Existence / Non-Existence of a Target

Template of host

```html
<section *ngIf="loggedInUser" class="greeting">
  <span> Hi {{ loggedInUser.name }}! </span>
</section>
```

Declarative tests

```ts
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

#### Provoke an Event and Check a Service has been Called

Template of host

```html
<section *ngIf="loggedInUser" class="greeting">
  <button (click)="authService.logout()">Logout</button>
</section>
```

Declarative tests

```ts
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

#### Check that a Method has been Called on a NativeElement

Template of host

```html
<input #textbox [value]="text" />
<button (click)="clearAndFocusTextbox(textbox)">X</button>
```

Declarative tests

```ts
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
      // hint: "nativeMethod" can be imported from @centigrade/ngtx
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
class the {
  static FullNameSpan() {
    return get('span');
  }
}

it('should focus the textbox on button clear-click', () => {
  When(host)
    .has(state({ firstName: 'Ann', lastName: 'Smith' }))
    // hint: "componentMethod" can be imported from @centigrade/ngtx
    .and(call(componentMethod, 'ngOnChanges', { firstName: true }))
    .expect(the.FullNameSpan)
    .to(haveText('Hi Ann Smith!'));
});
```

## Whole Examples

### Example 1: CartView

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

// ------------------------
// Custom predicates:
// ------------------------

// hint: type "Type<...>" is imported from @angular/core:
const providerWithState = <Provider>(
  provider: Type<Provider>,
  stateDef: Partial<Provider>,
) =>
  createExtensionFn((getTargets, { addPredicate }, fixture) => {
    addPredicate(() => {
      // hint: ngtx supports manipulation of multiple targets,
      // so per default it passing arrays:
      getTargets().forEach((target) => {
        const providerInstance = target.injector.get(provider);

        Object.entries(stateDef).forEach(([property, overrideValue]) => {
          (providerInstance as any)[property] = overrideValue;
        });
      });

      // hint: our manipulation to service possibly requires a view update,
      // so triggering it afterwards:
      fixture.detectChanges();
    });
  });
```
