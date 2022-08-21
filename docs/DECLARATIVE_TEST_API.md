## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **Declarative Testing API**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> #### First Steps
>
> Learn how to integrate ngtx into your test cases step by step. The [first steps page][firststeps] is the perfect starting point, when you never worked with ngtx before.
>
> #### Writing Good Tests
>
> Learn how to write [robust and readable tests][goodtests].
>
> #### Extension Functions
>
> Learn how to extend ngtx' declarative testing API to suit your custom needs: [extension functions page][extensionfns].
>
> #### Feature API
>
> Formal documentation of ngtx' [imperative test helpers][api].

---

</details>

&nbsp;

> 🚧 **Please Note:** this page is in an early stage and still work-in-progress.
>
> If you have ideas how to improve this article, please don't hesitate to open an issue!

## Declarative Testing API

## Formal API Documentation

> #### `When(subject)`
>
> Entry point for ngtx' declarative testing API returning the `DeclarativeTestingApi`.
>
> It expects a `TargetRef` as only argument. A `TargetRef` is a function without parameters that returns a `NgtxTarget` (either `NgtxElement` or `NgtxMultiElement`). This `NgtxTarget` will be passed the predicate(s) following in the sentence.
>
> ```ts
> When(subjectRef: TargetRef): DeclarativeTestingApi
> ```

---

### Declarative Testing API

Provides APIs to describe start situations for your test cases:

> #### `rendered()`
>
> Lets the component-under-test render and returns the `AfterPredicateApi`.
>
> ```ts
> rendered(): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> it('should have open set to false initially', () => {
>   When(host)
>     .rendered()
>     .expect(host)
>     .to(haveState({ open: false }));
> });
> ```

> #### `calls(targetResolver, methodOnTarget, ...args)`
>
> Sets up a call to the specified method on the target that the target-resolver-function resolved from the **subject** (optionally with the passed arguments) and then returns the `AfterPredicateApi`.
>
> ```ts
> calls(resolver: (subject: Subject) => Target, method: keyof Target, ...callArgs: any[]): AfterPredicateApi
> ```
>
> Example
>
> ```ts
> import {
>   componentMethod,
>   nativeMethod,
>   injected /*...*/,
> } from '@centigrade/ngtx';
>
> const DropDown = () => get(DropDownComponent);
> const Header = () => get(HeaderComponent);
> const Title = () => get('span.title');
>
> When(DropDown)
>   .calls(componentMethod, 'setOpen', [true])
>   .expect(DropDown)
>   .to(haveState({ open: true }));
>
> When(DropDown)
>   .calls(nativeMethod, 'click')
>   .expect(DropDown)
>   .to(haveState({ open: true }));
>
> When(Header)
>   .calls(injected(LanguageService), 'setLanguage', ['en-US'])
>   .expect(Title)
>   .to(haveText('Welcome!'));
> ```
>
> **Example:**
>
> ```ts
> import { componentMethod, nativeMethod, injected } from '@centigrade/ngtx';
>
> const Expander = () => get(ExpanderComponent);
> const NativeInput = () => get('input');
> const DialogView = () => get(DialogViewComponent);
>
> // calls the "toggle"-method on the expander's component instance
> When(Expander).calls(componentMethod, 'toggle').expect(...).to(...);
> // calls the "focus"-method on the input's native element
> When(NativeInput).calls(nativeMethod, 'focus').expect(...).to(...);
> // calls the "close"-method on the DialogService, resolved using the expander's injector
> When(DialogView).calls(injected(DialogService), 'close').expect(...).to(...);
> ```

> #### `emits(eventName, arg?)` | `emits(eventDispatcher)`
>
> Sets up an event emission on the **subject** (optionally with the passed argument) and then returns the `AfterPredicateApi`.
>
> ```ts
> emits(eventName: keyof Subject, eventArg?: any): AfterPredicateApi;
> emits(eventDispatcher: () => void): AfterPredicateApi;
> ```
>
> **Example:**
>
> ```ts
> import { nativeEvent } from '@centigrade/ngtx';
>
> // emits the click event on the button via Angular's `triggerEventHandler` debugElement function
> When(Button).emits('click').expect(...).to(...);
> // emits the selectionChange event with argument "Item 1" on DropDown component
> When(DropDown).emits('selectionChange', 'Item 1').expect(...).to(...);
> // emits an "input"-event on the input-element via nativeElement.dispatchEvent(...) on the NativeInput
> When(NativeInput).emits(nativeEvent('input', new KeyboardEvent({ key: 'x' }))).expect(...).to(...);
> ```

> #### `attributes(attrMap)`
>
> Sets up the **subject** to have the attributes passed as object-map on its `nativeElement` and then returns the `AfterPredicateApi`.
>
> **Signature:**
>
> ```ts
> attributes(attrMap: Record<keyof Subject, any>): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> const NativeInput = () => get<HTMLInputElement, unknown>('input');
>
> When(NativeInput)
>   .has(attributes({ value: 'some text' }))
>   .and(host)
>   .calls(componentMethod, 'clearText')
>   .expect(NativeInput)
>   .to(haveAttribute({ value: '' }));
> <<<<<<< HEAD
> When(NativeInput).has(attributes({ disabled: true, value: 'some text' })) ...
> =======
> >>>>>> 19876ccc6f31020da115271cea5413d24a06b7fc
> ```

> #### `state(propMap)`
>
> Sets up the **subject** to have the properties passed as object-map on the `componentInstance` and then returns the `AfterPredicateApi`.
>
> ```ts
> state(propMap: Record<keyof Subject, any>): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> const Expander = () => get(ExpanderComponent);
>
> When(Expander)
>   .has(state({ open: false }))
>   .and(Expander)
>   .gets(clicked())
>   .expect(Expander)
>   .to(haveState({ open: true }));
> <<<<<<< HEAD
> When(Expander).has(state({ open: false })) ...
> =======
> >>>>>> 19876ccc6f31020da115271cea5413d24a06b7fc
> ```

> #### `does(extensionFn)`
>
> Allows to add custom logic to the test case via [extension functions][extensionfns].
>
> **aliases**: `get`, `gets`, `have`, `has`, `are`, `is`
>
> ```ts
> does(extensionFn: ExtensionFn): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> import { ExtensionFn, haveEmitted } from '@centigrade/ngtx';
>
> // custom extension function for ngtx, used in the test case below with "does"
> const pressKey =
>   (pressedKey: string): ExtensionFn<HTMLElement, unknown> =>
>   (targets, { addPredicate }, fixture) => {
>     addPredicate(() => {
>       /* 
>         the targets given to our extension function could be ...
>           1) either a single target -> get(SomeComponent),
>           2) or multiple targets -> getAll(SomeComponent)
>         
>         to unify this, ngtx always passes a list of targets to extension functions,
>         even if only a single target has been passed. This way ngtx simplifies the
>         the implementation of extension function by avoiding the need to check
>         for the target type (singular or plural):
>       */
>       targets()
>         .ngtxElements()
>         .forEach((element) => {
>           const keyEvent = new KeyboardEvent('keypress', { key: pressedKey });
>           element.nativeElement.dispatchEvent(keyEvent);
>         });
>
>       fixture.detectChanges();
>     });
>   };
>
> it('should emit the close event on escape key press', () => {
>   // "does" could be swapped with has/have, is/are and gets/get;
>   //  all of them would work, but "does" matches the semantics of the sentence best:
>   When(host).does(pressKey('escape')).expect(host).to(haveEmitted('close'));
> });
> ```

---

### After Predicate API

Allows to specify the **object** of your test case or add additional custom logic to it via the `and` API. The object will always be the thing that will be checked for effects done by the **subject and predicate**. If the assertions on the object fail, your test fails.

> #### `expect(object)`
>
> Takes a `TargetRef` as a single argument, that will be stored as **object** of the test case. **Objects** are tested against the assertions specified via the `Expectations`-API.
>
> ```ts
> expect(object: TargetRef): Expectations
> ```

> #### `and(extensionFn)`
>
> Takes an arbitrary number of extension functions being able to change the internal test state of the current test and returns the `Expectations`. To learn more about extensibility, please refer to the [extension functions][extensionfns] page.
>
> ```ts
> and(...extensionFns: ExtensionFn[]): Expectations
> ```

---

### Expectations API

Allows to define assertions that should be run on the `object` at the end of the test case and to negate them via `not`.

> #### `not`
>
> Negates the assertion that is following this property and returns the `Expectations`-API. Works the same way as in other JavaScript testing frameworks like `jasmine` or `jest`.
>
> ```ts
> not: Expectations;
> ```
>
> **Example**:
>
> ```ts
> // expects the host to be present:
> ...expect(host).not.to(beMissing());
> ```

> #### `haveCalled(targetResolver, method, emissionOpts?)`
>
> Expects that the test case's **object** has called the specified `method` on the resolved target. Optionally takes `EmissionOptions` allowing to specify additional aspects for the function-spy check.
>
> ```ts
> haveCalled(targetResolver: TargetResolverFn, method: keyof Object, emissionOpts?: EmissionOptions): void
> ```
>
> **Example**:
>
> ```ts
> import { ngtx, injected, componentMethod, nativeMethod } from '@centigrade/ngtx';
>  // expects object to have called a method on an object's service.
> ...expect(host).to(haveCalled(injected(SomeService), 'someMethod'));
>  // expects object to have called a method on its componentInstance.
> ...expect(host).to(haveCalled(componentMethod, 'someInstanceMethod'));
>  // expects object to have called a method on its nativeElement.
> ...expect(host).to(haveCalled(nativeMethod, 'someElementMethod'));
>  // specifies additional parameters:
> ...expect(host).to(haveCalled(nativeMethod, 'scrollIntoView', {
>   args: { behavior: 'smooth' },
>   times: 2,
> }));
> ```

> #### `haveCssClass(classNames)`
>
> Expects that the test case's **object** has the specified css classes present on its nativeElement's class list.
>
> ```ts
> haveCssClass(classNames: (string | string[] | undefined)[]): void
> ```
>
> **Example**:
>
> ```ts
> const Items = () => getAll('.drop-down-item');
> // expects the CuT to have the css classes "focused" and "selected":
> ...expect(host).to(haveCssClass('selected'));
> // if e.g. the first item is irrelevant, you can skip it by passing undefined:
> ...expect(Items).to(haveCssClass([undefined, 'selected', undefined]))
> ```

> #### `beFound(opts?)`
>
> Expects that the test case's **object** can be found in the CuT's html template.
>
> ```ts
> beFound(opts?: FindingOptions): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CloseButton to be findable in CuT's html template:
> // e.g. when its *ngIf evaluates to "true":
> const CloseButton = () => get('.btn.close');
> ...expect(CloseButton).beFound();
> ```

> #### `toBeMissing()`
>
> Expects that the test case's **object** is **not** present (i.e. **cannot** be found) in the CuT's html template.
>
> ```ts
> toBeMissing(): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CloseButton NOT to be findable in CuT's html template:
> // e.g. when its *ngIf evaluates to "false":
> const CloseButton = () => get('.btn.close');
> ...expect(CloseButton).toBeMissing();
> ```

> #### `toContainText(subStr)`
>
> Expects that the test case's **object** contains the specified substring (case sensitive).
>
> ```ts
> toContainText(subStr: string): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CloseButton NOT to be findable in CuT's html template:
> // e.g. when its *ngIf evaluates to "false":
> const Headline = () => get('h1');
> ...expect(Headline).toContainText('Welcome');
> ```

> #### `toHaveText(text)`
>
> Expects that the **object's** text-content equals the specified string (case sensitive).
>
> ```ts
> toHaveText(text: string): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CloseButton NOT to be findable in CuT's html template:
> // e.g. when its *ngIf evaluates to "false":
> const Headline = () => get('h1');
> ...expect(Headline).toHaveText('Welcome Ann!');
> ```

> #### `toHaveState(propMap)`
>
> Expects that the **object's** `componentInstance` contains all of the specified properties with their given values.
>
> ```ts
> toHaveState(propMap: Record<keyof Object, any>): void
> ```
>
> **Example**:
>
> ```ts
> // expects the InputFieldComponent to be disabled and have text "Hi!"
> const InputField = () => get(InputFieldComponent);
> ...expect(InputField).toHaveState({ disabled: true, text: 'Hi!' });
> ```

> #### `toHaveAttributes(attrMap)`
>
> Expects that the **object's** `nativeElement` contains all of the specified attributes with their given values.
>
> ```ts
> toHaveAttributes(attrMap: Record<keyof Object, any>): void
> ```
>
> **Example**:
>
> ```ts
> // expects the HTMLInputElement to be readonly and have value "Hi!"
> const NativeInput = () => get<HTMLInputElement, unknown>('input');
> ...expect(NativeInput).toHaveAttributes({ readonly: true, value: 'Hi!' });
> ```

> #### `toEmit(eventName, emissionOpts?)`
>
> Expects that the **object** has emitted the specified event. Optionally takes `EmissionOptions` that allow to further specify aspects of the expected event emission.
>
> ```ts
> toEmit(eventName: keyof Object, emissionOpts?: EmissionOptions): void
> ```
>
> **Example**:
>
> ```ts
> // expects the HTMLInputElement to be readonly and have value "Hi!"
> const InputField = () => get(InputFieldComponent);
> ...expect(InputField).toEmit('textChange', {
>   args: 'newText!',
>   times: 1,
> });
> ```

> #### `to(extensionFn)`
>
> Allows to add custom (assertion) logic to the test case by allowing to edit its internal state. If you like to learn more on how to extend ngtx, please have a look on the [extension functions][extensionfns] page.
>
> ```ts
> to(extensionFn: ExtensionFn): void
> ```

---

## Interfaces

## EmissionOptions

Allows to specify more precise checks when event-emissions are expected.

```ts
interface EmissionOptions {
  args?: any;
  times?: number;
  whichReturns?: any;
}
```

[api]: ./DOCUMENTATION.md
[harnesses]: ./HARNESSES.md
[goodtests]: ./GOOD_TESTS.md
[firststeps]: ./FIRST_STEPS.md
[extensionfns]: ./EXTENSION_FNS.md
[home]: ../README.md
