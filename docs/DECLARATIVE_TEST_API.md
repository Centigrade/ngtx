## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **Declarative Testing API**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### First Steps
>
> Learn how to integrate ngtx into your test cases step by step. The [first steps page][firststeps] is the perfect starting point, when you never worked with ngtx before.
>
> ### Writing Good Tests
>
> Learn how to write [robust and readable tests][goodtests].
>
> ### Feature API
>
> Formal documentation of ngtx' [imperative test helpers][api].

---

</details>

> 🚧 **Please Note:** this page is in an early stage and still work-in-progress.
>
> If you have ideas how to improve this article, please don't hesitate to open an issue!

## Declarative Testing API

ngtx provides an easy to read, declarative testing API for Angular tests. This api is the next logical step helping us to create short, precise and most of all DRY tests.

### API Schema

The API follows a schema that is similar to a classic, human-language sentence:

```
When <subject> <predicate> expect <object> to <assertion>
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

The power of this scheme is that it can express anything in a pretty natural and human-readable way. It is precise and easy to understand at the same time.

## Getting Started

**In order to set up ngtx' declarative API...**

1. add ngtx to your test suite,
2. import the `useFixture`-, `When`-, `host`- and `get`-helper and
3. add the CuT component type as a generic argument to the ngtx function call

```ts
describe(
  'ExpanderComponent',
  ngtx<ExpanderComponent>(({ useFixture, When, host, get }) => {
    // skipping rest of test file for the sake of brevity ...
  }),
);
```

Once we have done this, you can create your declarative tests by using the `When` function:

```ts
import { ngtx, then } from '@centigrade/ngtx';

class Expanders {
  static Title() {
    // set unknown as ComponentType to improve typing in declarative api later...
    return get<HTMLSpanElement, unknown>('span.title');
  }
}

it('[ExpanderComponent] should toggle its open property on title click', () => {
  When(host)
    .hasState({ open: false })
    .and(then(Expanders.Title).emits('click'))
    .expect(host)
    .toHaveState({ open: true });
});
```

This test case is complete and works just by describing the starting situation (`subject` and `hasState(...)`) an `predicate` triggering the `object` (`host`) to react with a state change (`toHaveState(...)`).

This test case is just an example. ngtx provides many built-in `predicates` and `assertions` for your convenience. If there are cases that are not possible to test with existing APIs, there are also extension points for custom `predicates` and `assertions`.

In fact you already saw one: the imported `then` function is an `DeclarativeTestExtension` function that is coming with the default ngtx package. But we talk more about extensibility at the end of this documentation.

## Formal API Documentation

> ### `When(subject: PartRef): DeclarativeTestingApi`
>
> Entry point for ngtx' declarative testing API returning the `DeclarativeTestingApi`.
>
> It expects a `PartRef` as only argument. A `PartRef` is a function without parameters that returns a `NgtxElement` (`NgtxMultiElement`s are currently not supported). This `NgtxElement` will be stored as **subject** of the test case.
>
> ```ts
> When(subjectRef: PartRef): DeclarativeTestingApi
> ```

---

### DeclarativeTestingApi

Provides APIs to describe start situations for your test cases:

> ### `rendered()`
>
> Lets the component-under-test render and returns the `AfterPredicateApi`.
>
> ```ts
> rendered(): AfterPredicateApi
> ```

> ### `calls(method, ...args)`
>
> Calls the specified method on the **subject** (optionally with the passed arguments) and then returns the `AfterPredicateApi`.
>
> ```ts
> calls(method: keyof Subject, ...callArgs: any[]): AfterPredicateApi
> ```

> ### `emits(eventName, arg?)`
>
> Emits the event on the **subject** (optionally with the passed argument) and then returns the `AfterPredicateApi`.
>
> ```ts
> emits(eventName: keyof Subject, eventArg?: any): AfterPredicateApi
> ```

> ### `hasAttributes(attrMap)`
>
> Sets the attributes passed as object-map on the **subject's** `nativeElement` and then returns the `AfterPredicateApi`.
>
> **Signature:**
>
> ```ts
> hasAttributes(attrMap: Record<keyof Subject, any>): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> const NativeInput = () => get<HTMLInputElement, unknown>('input');
> When(NativeInput).hasAttributes({ disabled: true, value: 'Hi!' }) ...
> ```

> ### `hasState(propMap)`
>
> Sets the properties passed as object-map on the **subject's** `componentInstance` and then returns the `AfterPredicateApi`.
>
> ```ts
> hasState(propMap: Record<keyof Subject, any>): AfterPredicateApi
> ```
>
> **Example:**
>
> ```ts
> const Expander = () => get(ExpanderComponent);
> When(Expander).hasState({ open: false }) ...
> ```

> ### `does(extensionFn)`
>
> Allows to add custom (predicate) logic to the test case via [extension functions][extensionfns].
>
> **aliases**: `gets`, `has`, `is`
>
> ```ts
> does(extensionFn: DeclarativeTestExtension): AfterPredicateApi
> ```

---

### AfterPredicateApi

Allows to specify the **object** of your test case or add additional custom logic to it via the `and` API. The object will always be the thing that will be checked for effects done by the **subject and predicate**. If the assertions on the object fail, your test fails.

> ### `expect(object)`
>
> Takes a `PartRef` as a single argument, that will be stored as **object** of the test case. **Objects** are tested against the assertions specified via the `Expectations`-API.
>
> ```ts
> expect(object: PartRef): Expectations
> ```

> ### `and(extensionFn)`
>
> Takes an arbitrary number of extension functions being able to change the internal test state of the current test and returns the `Expectations`. To learn more about extensibility, please refer to the [extension functions][extensionfns] page.
>
> ```ts
> and(...extensionFns: DeclarativeTestExtension[]): Expectations
> ```

---

### Expectations API

Allows to describe the expected effect that should have happened on the test case's **object**.

> ### `not`
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

> ### `toHaveCalled(targetResolver, method, emissionOpts?)`
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

> ### `toHaveCssClass(...classNames)`
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

> ### `toBePresent()`
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

> ### `toBeMissing()`
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

> ### `toContainText(subStr)`
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

> ### `toHaveText(text)`
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

> ### `toHaveState(propMap)`
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

> ### `toHaveAttributes(attrMap)`
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

> ### `toEmit(eventName, emissionOpts?)`
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

> ### `to(extensionFn)`
>
> Allows to add custom (assertion) logic to the test case by allowing to edit its internal state. If you like to learn more on how to extend ngtx, please have a look on the [extension functions][extensionfns] page.
>
> ```ts
> to(extensionFn: DeclarativeTestExtension): void
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
[goodtests]: ./GOOD_TESTS.md
[firststeps]: ./FIRST_STEPS.md
[extensionfns]: ./FIRST_STEPS.md
[home]: ../README.md
