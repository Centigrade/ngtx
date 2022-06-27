## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp; → &nbsp; Built-In Functionality

[home]: ../README.md
[index]: ../index.md
[docs]: ../../DOCUMENTATION.md
[declarative]: ./index.md
[extensionfns]: ../custom-extensions.md

<!--  -->

[attributes]: ./predicates/attributes.md
[calllifecyclehook]: ./predicates/call-life-cycle-hook.md
[call]: ./predicates/call.md
[clicked]: ./predicates/clicked.md
[debug]: ./predicates/debug.md
[detectchanges]: ./predicates/detect-changes.md
[emit]: ./predicates/emit.md
[state]: ./predicates/state.md
[waitfakeasync]: ./predicates/wait-fake-async.md

<!--  -->

[befound]: ./assertions/be-found.md
[bemissing]: ./assertions/be-missing.md
[containtext]: ./assertions/contain-text.md
[haveattributes]: ./assertions/have-attributes.md
[havecalled]: ./assertions/have-called.md
[havecssclass]: ./assertions/have-css-class.md
[haveemitted]: ./assertions/have-emitted.md
[havestate]: ./assertions/have-state.md
[havetext]: ./assertions/have-text.md

## List of all built-in Predicates

A predicate is a function that executes an operation on a given target. A test case can contain an arbitrary number of predicates that will be executed in the order they appear. The following list shows an overview on all built-in predicates. Please note that you can also [write your own predicates][extensionfns], if there is a use case that is not covered by the built-in predicates.

> ### [attributes]
>
> Predicate that sets user-defined attributes on the target's `nativeElement`.
>
> ```ts
> When(the.Button).has(attributes({ disabled: true })).expect(...).to(...);
> ```

> ### [callLifeCycleHook]
>
> Predicate that calls the specified Angular life-cycle-hooks on the target's `componentInstance`.
>
> ```ts
> When(host).does(callLifeCycleHook({ ngOnInit: true })).expect(...).to(...);
> ```

> ### [call]
>
> Predicate that calls a specified method on a user-defined target.
>
> ```ts
> When(the.Expander).does(call(componentMethod, 'toggle')).expect(...).to(...);
> When(the.Input).does(call(nativeMethod, 'focus')).expect(...).to(...);
> When(the.DialogView).does(call(injected(DialogService), 'close')).expect(...).to(...);
> ```

> ### [clicked]
>
> Predicate that simulates a click-event or native click on its target.
>
> ```ts
> When(the.Button).gets(clicked()).expect(...).to(...);
> ```

> ### [debug]
>
> Predicate that prints out the current testing-DOM state at the moment of calling.
>
> ```ts
> When(the.ClearIcon).gets(clicked()).and(debug()).expect(...).to(...);
> ```

> ### [detectChanges]
>
> Predicate that detects changes and applies them to the view.
>
> ```ts
> When(host).calls(injected(DataService), 'loadAll').and(detectChanges()).expect(...).to(...);
> ```

> ### [emit]
>
> Predicate that emits the specified event with an optional argument.
>
> ```ts
> When(the.DropDown).does(emit('selectionChange', 'Item 1')).expect(...).to(...);
> ```

> ### [state]
>
> Predicate that sets the specified state on the target's `componentInstance`
>
> ```ts
> When(host).has(state({ items: ['a', 'b', 'c'] }).expect(...).to(...);
> ```

> ### [waitFakeAsync]
>
> Predicate that waits the specified amount of time within a `fakeAsync` zone.
>
> ```ts
> When(host).has(state({ items$: of(['a', 'b', 'c']) }).and(waitFakeAsync()).expect(...).to(...);
> ```

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
