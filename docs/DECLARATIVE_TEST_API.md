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

ngtx provides an easy to read, declarative testing API for Angular tests. This api is the next logical step helping us to create short, precise and most of all DRY tests.

### API Schema

The API follows a schema that is similar to a classic, human-language sentence:

```
When <subject> <predicate> [and <subject>? <predicate>]* expect <object> not? to <assertion>

Legend:
-----------------------
[ ... ]: group
*: 0 - arbitrary times
?: optional
```

where `<subject>` and `<object>` are references to sub-components located in the template of the component-under-test ("CuT") or even the CuT itself and the `<predicate>` is an action on the `<subject>` triggering an effect on the object, that then will be checked by the `<assertion>`.

To foster your understanding of this scheme, consider following examples:

```
When <the ExpanderComponent> <is open> expect <the ng-content> to <be present>
     ~~~~~~~~~~~~~~~~~~~~~~~  ~~~~~~~~        ~~~~~~~~~~~~~~~      ~~~~~~~~~~~~
     subject                  predicate        object              assertion

When <the ClearButton> <gets clicked> expect <the SearchBox> to <have no text>.
When <the NativeInput> <emits change event> expect <the CuT> to <emit textChange>.
```

Let's see a more advanced test schema:

```
When <the DropDown> <is disabled> and <gets clicked> expect <the DropDown> not to <toggle openState>.
     ~~~~~~~~~ ~~~~~~~~~~~~~     ~~~~~~~~~~~~~~        ~~~~~~~~~           ~~~   ~~~~~~~~~~~~~~~~~~~
     subject   predicate-1       predicate-2           object         negation   assertion
```

The power of this scheme is that it can express anything in a pretty natural and human-readable way. It is precise and easy to understand at the same time.

## Getting Started

**In order to set up ngtx' declarative API...**

1. add ngtx to your test suite,
2. import the `useFixture`-, `When`-, `host`-, `get`- and/or `getAll`-helper and
3. add the CuT component type as a generic argument to the ngtx function call

```ts
describe(
  'ExpanderComponent',
  ngtx<ExpanderComponent>(({ useFixture, When, host, get }) => {
    // skipping rest of test file for the sake of brevity ...
  }),
);
```

Once we have done this, you can create your declarative tests by using the `When` function and a [component test harness][harnesses] class:

```ts
import { ngtx, state, haveState, clicked } from '@centigrade/ngtx';

// component test harness:
class the {
  static Title() {
    return get<HTMLSpanElement>('span.title');
  }
}

// test case using ngtx' declarative testing api
it('[ExpanderComponent] should toggle its open property on title click', () => {
  // note: "host" is the component-under-test (the expander)
  When(host) // subject 1
    .has(state({ open: false })) // predicate operating on subject 1
    .and(the.Title) // subject 2
    .gets(clicked()) // predicate operating on subject 2
    .expect(host) // object
    .to(haveState({ open: true })); // assertion checking the object
});
```

> ### The test translates to:
>
> When the expander has its class-property `open` set to `false`, and then the title gets clicked,
> expect the expander to have the open property toggled to `true`.

This test case is just an example. ngtx provides many built-in `predicates` and `assertions` for your convenience. If there are cases that are not possible to test with existing APIs, there are also extension points for custom `predicates` and `assertions`.

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

> #### `emits(eventName, arg?)` | `emits(eventDispatcher)`
>
> Sets up an event emission on the **subject** (optionally with the passed argument) and then returns the `AfterPredicateApi`.
>
> ```ts
> emits(eventName: keyof Subject, eventArg?: any): AfterPredicateApi
> emits(eventDispatcher: (subject: Subject) => void): AfterPredicateApi
> ```
>
> Examples:
>
> ```ts
> import { nativeEvent /*...*/ } from '@centigrade/ngtx';
>
> const OkButton = () => get('.btn.ok');
> const Input = () => get('input');
>
> When(OkButton).emits('click').expect(host).to(haveEmitted('close'));
> When(Input)
>   .emits(nativeEvent('input', new KeyboardEvent({ ctrlKey: true, key: 'z' })))
>   .expect(host)
>   .to(haveCalled(componentMethod, 'undo'));
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
> ```

> #### `does(extensionFn)`
>
> Allows to add custom logic to the test case via [extension functions][extensionfns].
>
> **aliases**: `gets`, `has`, `is`
>
> ```ts
> does(extensionFn: ExtensionFn): AfterPredicateApi
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

Allows to describe the expected effect that should have happened on the test case's **object**.

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
> ...expect(host).not.toBeMissing();
> ```

> #### `toHaveCalled(targetResolver, method, emissionOpts?)`
>
> Expects that the test case's **object** has called the specified `method` on the resolved target. Optionally takes `EmissionOptions` allowing to specify additional aspects for the function-spy check.
>
> ```ts
> toHaveCalled(targetResolver: TargetResolverFn, method: keyof Object, emissionOpts?: EmissionOptions): void
> ```
>
> **Example**:
>
> ```ts
> import { ngtx, injected, componentMethod, nativeMethod } from '@centigrade/ngtx';
>  // expects object to have called a method on an object's service.
> ...expect(host).toHaveCalled(injected(SomeService), 'someMethod');
>  // expects object to have called a method on its componentInstance.
> ...expect(host).toHaveCalled(componentMethod, 'someInstanceMethod');
>  // expects object to have called a method on its nativeElement.
> ...expect(host).toHaveCalled(nativeMethod, 'someElementMethod');
>  // specifies additional parameters:
> ...expect(host).toHaveCalled(nativeMethod, 'scrollIntoView', {
>   args: { behavior: 'smooth' },
>   times: 1,
> });
> ```

> #### `toHaveCssClass(...classNames)`
>
> Expects that the test case's **object** has the specified css classes present on its nativeElement's class list.
>
> ```ts
> toHaveCssClass(...classNames: string[]): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CuT to have the css classes "focused" and "selected":
> ...expect(host).toHaveCssClass('focused', 'selected');
> ```

> #### `toBePresent()`
>
> Expects that the test case's **object** is present (i.e. can be found) in the CuT's html template.
>
> ```ts
> toBePresent(): void
> ```
>
> **Example**:
>
> ```ts
> // expects the CloseButton to be findable in CuT's html template:
> // e.g. when its *ngIf evaluates to "true":
> const CloseButton = () => get('.btn.close');
> ...expect(CloseButton).toBePresent();
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
