## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; Declarative Testing

[home]: ../README.md
[docs]: ../DOCUMENTATION.md
[declarative]: ./built-in.md
[extensions]: ./custom-extensions.md

Quick Navigation: &nbsp; [Built-In Predicates and Assertions][declarative] ・ [Write Custom Extensions][extensions]

---

ngtx provides a powerful, yet easy to read, declarative testing API for Angular tests. This api is the next logical step helping us to create short, precise and most of all DRY tests.

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

... where the `<subject>`s and `<object>` are references to parts (such as child-components or HTML elements) located in the template of the component-under-test ("CuT") or the CuT itself; and the `<predicate>` is are actions that get executed on their respective `<subject>`s triggering an effect on the object, that then will be checked by the `<assertion>`.

This might sound a bit abstract, so to foster your understanding of this scheme, consider following examples:

```
When <the ExpanderComponent> <is open> expect <the ng-content> to <be present>
     ~~~~~~~~~~~~~~~~~~~~~~~ ~~~~~~~~~        ~~~~~~~~~~~~~~~~    ~~~~~~~~~~~~
     subject                 predicate        object              assertion

When <the ClearButton> <gets clicked> expect <the SearchBox> to <have no text>.
When <the NativeInput> <emits change event> expect <the CuT> to <emit textChange>.
```

Let's see a more advanced test:

```
When <the DropDown> <is disabled> and <gets clicked> expect <the DropDown> not to <toggle openState>.
     ~~~~~~~~~~~~~~ ~~~~~~~~~~~~~     ~~~~~~~~~~~~~~        ~~~~~~~~~      ~~~    ~~~~~~~~~~~~~~~~~~~
     subject        predicate-1       predicate-2           object     negation   assertion

When <the Form> <has errors> and <the OkButton> <gets clicked> expect <CuT> not to <emit close event>.
When <the CuT> <is disabled> and <NativeInput> <emits input event> expect <CuT> to <have initial text>.
```

The power of this scheme is that it can express anything in a pretty natural and human-readable way. It is precise and easy to understand at the same time.

> ## Tip
>
> To see what predicates and assertions are built into ngtx, you can have a look at the [built-in functionality overview][declarative].

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

---

Read further about this topic: &nbsp; [Predicates] ・ [Assertions] ・ [Write Custom Extensions][extensions]
