## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **ngtx Examples**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### First Steps
>
> For those who are new to Angular application testing with ngtx, we recommend to start with the [first steps article][firststeps]. After this article you should be good to go with the examples in this article. This article primarily targets developers that already know ngtx or at least have experience with writing Angular tests.
>
> ### Declarative Testing API
>
> Formal documentation of ngtx' [declarative testing api][declarativetests] helping you to write beautiful, simple and robust tests.
>
> ### Feature Overview
>
> You may want to visit our [feature overview page][features] listing some helpers, to quickly explore how ngtx can support you.

---

</details>

&nbsp;

This article gives a basic overview on a range of ngtx helpers.

The following examples are influenced by real enterprise applications, ngtx was used in. It demonstrates how ngtx can help you writing tests that are easier to read and maintain. Please note that the following test-cases are actually coming from _different_ components, i.e. multiple, unrelated test-suites. They are put here together for the sake of brevity. In a real application they must remain in separated test-suites with their own `TestBed`s and `fixtures`, of course.

This article will only show examples where ngtx is used in a "standalone" way, without additional constructs around it; but in our experience the best way of using ngtx is along with component harnesses, which is explained [in this article][good-tests].

> ### Ever heard of Component Harnesses?
>
> ngtx can be used in several different ways, but we think the best way is along with test-component-harnesses, which are small APIs abstracting the test-cases from breaking changes of the component under test. If you want to know more about it, and how to use it with ngtx, have a look into our ["writing good tests"-guide][good-tests].

```ts
import {
  ngtx,
  clicked,
  haveEmitted,
  state,
  haveState,
  asBool,
} from '@centigrade/ngtx';

const DIALOG_CANCEL = 'Cancel';

describe(
  'Some random tests as basic examples',
  ngtx(({ useFixture, When, host, get, getAll }) => {
    let component: AnyComponent;
    let fixture: ComponentFixture<AnyComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        /* ... */
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(AnyComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    // Component Testing Harness:
    class the {
      static FinishButton() {
        return getAll<HTMLElement>(['.btn-primary', '.btn-secondary']).find(
          (button) => button.textContent().includes(DIALOG_CANCEL),
        );
      }
      static TabItems() {
        return getAll(TabComponent);
      }
      static Wizard() {
        return get(WizardComponent);
      }
      static Input() {
        return get<HTMLInputElement>('input');
      }
      static DropDownLabel() {
        return get('.drop-down-label');
      }
    }

    it('[Wizard] should emit the finish-event when clicking on cancel button', () => {
      const userAction: WizardResult = 'canceled';

      When(the.FinishButton)
        .gets(clicked())
        .expect(host)
        .to(haveEmitted('finish', { arg: userAction }));
    });

    it('[TabsComponent] should pass through translation to all tab items', () => {
      When(host)
        .has(state({ translate: true }))
        .expect(the.TabItems)
        .to(haveState({ translateLabel: true }));
    });

    it('[Dialog] should emit closeDialog event on finishWizard event', () => {
      When(the.Wizard)
        .emits('finishWizard')
        .expect(host)
        .to(haveEmitted('closeDialog'));
    });

    it('[TextField] should pass the readonly attribute', () => {
      When(host)
        .has(state({ readonly: true }))
        .expect(the.Input)
        .to(haveAttribute<HTMLInputElement>({ readOnly: 'true' }));
    });

    it('[SomeView] should show a drop down with the currently selected item', () => {
      const expectedValue = 'selected item';

      When(host)
        .has(state({ selectedItem: expectedValue }))
        .and(callLifeCycleHook({ ngOnChanges: { selectedItem: true } }))
        .expect(the.DropDownLabel)
        .to(haveText(expectedValue));
    });
  }),
);
```

[api]: ./DOCUMENTATION.md
[declarativetests]: ./DECLARATIVE_TEST_API.md
[features]: ./FEATURES.md
[firststeps]: ./FIRST_STEPS.md
[good-tests]: ./GOOD_TESTS.md
[home]: ../README.md
