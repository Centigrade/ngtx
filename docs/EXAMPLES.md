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
> You may want to visit our [feature overview page][features] listing some helpers, to quickly explore what ngtx can do for you.

---

</details>

&nbsp;

This article gives a basic overview on a range of ngtx helpers.

The following examples are taken from real world applications and show in what way ngtx can help writing tests that are easier to read and maintain. Please note that the following test-cases are actually coming from _different_ components, i.e. multiple, unrelated test-suites. They are put here together for the sake of brevity. In a real application they must remain in separated test-suites with their own `TestBed`s and `fixtures`, of course.

This article will only show examples where ngtx is used in a "standalone" way, without additional constructs around it; but in our experience the best way of using ngtx is along with component harnesses, which is explained [in this article][good-tests].

> ### Ever heard of Component Harnesses?
>
> ngtx can be used in several different ways, but we think the best way is along with test-component-harnesses, which are small APIs abstracting the test-cases from breaking changes of the component under test. If you want to know more about it, and how to use it with ngtx, have a look into our ["writing good tests"-guide][good-tests].

```ts
import { ngtx, asBool } from '@centigrade/ngtx';

const DIALOG_CANCEL = 'Cancel';

describe(
  'Some random tests as basic examples',
  ngtx(({ useFixture, detectChanges, get, getAll }) => {
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

    it('[Wizard] should emit the finish-event when clicking on cancel button', () => {
      // arrange
      spyOn(component.finish, 'emit');

      // act
      const finishButton = getAll<HTMLElement>([
        '.btn-primary',
        '.btn-secondary',
      ]).find((button) => button.textContent().includes(DIALOG_CANCEL));

      finishButton.triggerEvent('click');

      // assert
      const userAction: WizardResult = 'canceled';
      expect(component.finish.emit).toHaveBeenCalledTimes(1);
      expect(component.finish.emit).toHaveBeenCalledWith(userAction);
    });

    it('[TabsComponent] should pass through translation', () => {
      // arrange
      component.translate = true;
      // act
      detectChanges();
      // assert
      const { componentInstance: tabs } = getAll(TabComponent);
      expect(tabs.translateLabel).toBe(true);
    });

    it('[Dialog] should emit closeDialog event on finishWizard event', () => {
      // arrange
      spyOn(component.closeDialog, 'emit');

      // act
      get(WizardComponent).triggerEvent('finishWizard');

      // assert
      expect(component.closeDialog.emit).toHaveBeenCalledTimes(1);
    });

    it('[TextField] should pass the readonly attribute', () => {
      // arrange
      const expectedValue = true;

      // pre-condition
      expect(get('input').attr('readOnly', asBool)).not.toBe(expectedValue);

      // act
      component.readonly = expectedValue;
      detectChanges();

      // assert
      expect(get('input').attr('readOnly', asBool)).toBe(expectedValue);
    });

    it('[SomeView] should show a drop down with the currently selected item', () => {
      // arrange
      const expectedValue = 'selected item';
      component.selectedItem = expectedValue;

      // act
      // passing "component" to "detectChanges"
      // additionally runs ngOnChanges and ngOnInit
      // on the component, if they are defined:
      detectChanges(component);

      // assert
      expect(get('.drop-down-label').textContent()).toContain(expectedValue);
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
