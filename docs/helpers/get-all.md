## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Helpers][helpers] &nbsp; → &nbsp; `getAll`

[home]: ../README.md
[docs]: ../DOCUMENTATION.md
[harnesses]: ../HARNESSES.md
[helpers]: ../helpers/index.md
[get]: ../helpers/get.md
[triggerevent]: ../helpers/trigger-event.md
[detectchanges]: ../helpers/detect-changes.md

Quick Navigation: &nbsp; [detectChanges][detectchanges] ・ [get][get] ・ getAll ・ [triggerEvent][triggerevent]

Queries the component-under-test's template for all instances of the specified template-part (either child-component or HTML-element). Your query string is of type `QueryTarget` and supports the following modes:

- query by directive: `getAll(ExpanderComponent)`
- query by css-selector: `getAll('.trigger')`
- query by ngtx-identifier: `getAll('ngtx_expander:ng-content')`

> ## 🤘 Pro Tip
>
> We **highly** recommended to use this helper only from within [test-component-harness classes][harnesses], as the repeated usage of `getAll` throughout the test-cases is not DRY, and thus considered bad practice.

### Example

```ts
describe(
  'ShoppingCartComponent',
  ngtx<ShoppingCartComponent>(({ useFixture, When, host, getAll }) => {
    let fixture: ComponentFixture<MyComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        /*...*/
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(MyComponent);
      useFixture(fixture);
    });

    // test component-harness class
    class the {
      static CartItems() {
        return getAll('ngtx_shopping-cart:items'); // by ngtx-identifier
      }
      static CartDialogButtons() {
        return getAll('.btn'); // by css-selector
      }
      static PaymentOptions() {
        return getAll(ToggleButtonComponent); // by directive
      }
    }

    // GOOD: use the component-harness class (here: "the.CartItems") 👍
    it('example test using the get-helper within the component-harness', () => {
      When(host) // host = ShoppingCartComponent
        .has(state({ items: ['Smartphone', 'Lipstick', 'T-Shirt'] }))
        .expect(the.CartItems)
        .to(beFound({ times: 3 }));
    });

    // BAD: use the get helper inside test-cases 👎
    it('BAD example test using the get-helper', () => {
      When(host)
        .has(state({ items: ['Smartphone', 'Lipstick', 'T-Shirt'] }))
        // this is not DRY, as you would write this expression in every test case
        // that needs to reference the cart-items of the ShoppingCartComponent... :(
        // (moreover it's significantly worse to read as the semantics are obfuscated)
        .expect(() => getAll('ngtx_shopping-cart:items'))
        .to(beFound({ times: 3 }));
    });
  }),
);
```
