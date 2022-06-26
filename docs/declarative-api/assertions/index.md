## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp; → &nbsp; Assertions

[home]: ../README.md
[extensionfns]: ../custom-extensions.md
[docs]: ../../DOCUMENTATION.md
[declarative]: ../index.md
[befound]: ./be-found.md
[bemissing]: ./be-missing.md
[containtext]: ./contain-text.md
[haveattributes]: ./have-attributes.md
[havecalled]: ./have-called.md
[havecssclass]: ./have-css-class.md
[haveemitted]: ./have-emitted.md
[havestate]: ./have-state.md
[havetext]: ./have-text.md

---

## List of all built-in Assertions

An assertion is a function that runs checks on a given target. A test case can contain an arbitrary number of assertions that will be executed in the order they appear. If one of the checks fail, the test case will fail, too. The following list shows an overview on all built-in assertions. Please note that you can also [write your own ones][extensionfns], if there is a use case that is not covered by the built-in assertions.

> ### [beFound]
>
> Assertion that checks for its target(s) to be present in the component-under-test's template.
>
> ```ts
> When(...).has(...).expect(the.CartItems).to(beFound({ times: 3 }));
> ```

> ### [beMissing]
>
> Assertion that checks for its target(s) not to be present in the component-under-test's template.
>
> ```ts
> When(...).has(...).expect(the.AdminTab).to(beMissing());
> ```

> ### [containText]
>
> Assertion that checks for its target(s) to contain the specified sub-string(s).
>
> ```ts
> When(...).has(...).expect(the.WelcomeLabel).to(containText('Welcome'));
> ```

> ### [haveAttributes]
>
> Assertion that checks for its target(s) to have the specified attribute(s) with the given values.
>
> ```ts
> When(...).has(...).expect(the.SubmitButton).to(haveAttributes({ disabled: true }));
> ```

> ### [haveCalled]
>
> Assertion that checks for its target(s) to have called a specified target method.
>
> ```ts
> When(...).has(...).expect(host).to(haveCalled(componentMethod, 'close'));
> ```

> ### [haveCssClass]
>
> Assertion that checks for its target(s) to have specified css-class(es).
>
> ```ts
> When(...).has(...).expect(the.Expander).to(haveCssClass('opened'));
> ```

> ### [haveEmitted]
>
> Assertion that checks for its target(s) to have emitted the specified event.
>
> ```ts
> When(...).has(...).expect(host).to(haveEmitted('textChange', { arg: 'new text' }));
> ```

> ### [haveState]
>
> Assertion that checks for its target(s) to have the specified state(s).
>
> ```ts
> When(...).has(...).expect(the.Expander).to(haveState({ open: true }));
> ```

> ### [haveText]
>
> Assertion that checks for its target(s) to have the specified (exact) text-content.
>
> ```ts
> When(...).has(...).expect(the.WelcomeMessage).to(haveText('Welcome Ann!'));
> ```
