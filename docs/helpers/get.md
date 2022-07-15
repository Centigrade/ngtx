## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Helpers][helpers] &nbsp; → &nbsp; `get`

[home]: ../README.md
[docs]: ../DOCUMENTATION.md
[harnesses]: ../HARNESSES.md
[helpers]: ../helpers/index.md
[getall]: ../helpers/get-all.md
[triggerevent]: ../helpers/trigger-event.md
[detectchanges]: ../helpers/detect-changes.md

Quick Navigation: &nbsp; [detectChanges][detectchanges] ・ get ・ [getAll][getall] ・ [triggerEvent][triggerevent]

---

Queries the component-under-test's template for the specified template-part (either child-component or HTML-element). Your query string is of type `QueryTarget` and supports the following modes:

- query by directive: `get(ExpanderComponent)`
- query by css-selector: `get('.trigger')`
- query by ngtx-identifier: `get('ngtx_expander:ng-content')`

> ## 🤘 Pro Tip
>
> We **highly** recommended to use this helper only from within [test-component-harness classes][harnesses], as the repeated usage of `get` throughout the test-cases is not DRY, and thus considered bad practice.

### Example

```ts
describe(
  'ExpanderComponent',
  ngtx<ExpanderComponent>(({ useFixture, When, host, get }) => {
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
      static Title() {
        return get('ngtx_expander:title'); // by ngtx-identifier
      }
      static NgContent() {
        return get('.content-container'); // by css-selector
      }
      static Toggle() {
        return get(ToggleButtonComponent); // by directive
      }
    }

    // GOOD: use the component-harness class (here: "the.Toggle") 👍
    it('example test using the get-helper within the component-harness', () => {
      When(host) // host = ExpanderComponent
        .has(state({ open: false }))
        .and(the.Toggle) // using the Toggle defined in the test component-harness
        .gets(clicked())
        .expect(host)
        .to(haveState({ open: true }));
    });

    // BAD: use the get helper inside test-cases 👎
    it('BAD example test using the get-helper', () => {
      When(host)
        .has(state({ open: false }))
        // this is not DRY, as you would write this expression in every test case
        // that needs to reference the toggle of the ExpanderComponent... :(
        // (moreover it's significantly worse to read as the semantics are gone)
        .and(() => get(ToggleButtonComponent))
        .gets(clicked())
        .expect(host)
        .to(haveState({ open: true }));
    });
  }),
);
```
