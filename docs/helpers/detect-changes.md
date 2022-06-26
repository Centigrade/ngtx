## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Helpers][helpers] &nbsp; → &nbsp; `detectChanges`

[home]: ../README.md
[docs]: ../DOCUMENTATION.md
[declarative]: ../DECLARATIVE_TEST_API.md
[helpers]: ../helpers/index.md
[get]: ../helpers/get.md
[get-all]: ../helpers/get-all.md
[triggerevent]: ../helpers/trigger-event.md
[detectchanges]: ../helpers/detect-changes.md
[detectchangesdeclarative]: ../declarative-api/detect-changes.md

Quick Navigation: &nbsp; detectChanges ・ [get][get] ・ [getAll][get-all] ・ [triggerEvent][triggerevent]

---

> ## @deprecated
>
> This helper should not be used anymore. Consider using the [declarative api][declarative] instead of the imperative usage of ngtx helpers.
> This helper will be removed in a future version of ngtx.
>
> **ngtx provides a declarative counter-part for this helper:** [detectChanges (declarative)][detectchangesdeclarative]

Detects changes and apply them to the view.

### Example

```ts
describe(
  'MyComponent',
  ngtx(({ useFixture, detectChanges }) => {
    let fixture: ComponentFixture<MyComponent>;
    let component: MyComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        /*...*/
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(MyComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    it('should emit an event on MyComponent instance', () => {
      component.someProperty = 42;
      detectChanges();
    });
  }),
);
```

When passing the component as an argument, `detectChanges` will run `ngOnInit` and `ngOnChanges` on the component (if present). If passing a second argument, you can control, what object should be passed to the `ngOnChanges` hook:

```ts
it('should emit an event on MyComponent instance', () => {
  component.someProperty = 42;
  // calls ngOnInit and ngOnChanges (if present) on the component:
  detectChanges(component, { someProperty: new SimpleChange(0, 42, false) });
});
```
