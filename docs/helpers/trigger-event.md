## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Helpers][helpers] &nbsp; → &nbsp; `triggerEvent`

[home]: ../README.md
[docs]: ../DOCUMENTATION.md
[declarative]: ../DECLARATIVE_TEST_API.md
[helpers]: ../helpers/index.md
[get]: ../helpers/get.md
[getall]: ../helpers/get-all.md
[detectchanges]: ../helpers/detect-changes.md

Quick Navigation: &nbsp; [detectChanges][detectchanges] ・ [get][get] ・ [getAll][getall] ・ triggerEvent

---

> ## @deprecated
>
> This helper should not be used anymore. Consider using the [declarative api][declarative] instead of the imperative usage of ngtx helpers.
> This helper will be removed in a future version of ngtx.

Triggers an event on the root debug element of the test-fixture.

### Example

```ts
describe(
  'MyComponent',
  ngtx(({ useFixture, triggerEvent }) => {
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

    it('should emit an event on MyComponent instance', () => {
      triggerEvent('someEvent', 42);
    });
  }),
);
```
