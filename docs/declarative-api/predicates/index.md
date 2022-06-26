## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Helpers][index] &nbsp; → &nbsp; Predicates

[home]: ../README.md
[index]: ../index.md
[docs]: ../DOCUMENTATION.md
[declarative]: ../DECLARATIVE_TEST_API.md
[attributes]: ./attributes.md
[calllifecyclehook]: ./call-life-cycle-hook.md
[call]: ./call.md
[clicked]: ./clicked.md
[debug]: ./debug.md
[detectchanges]: ./detect-changes.md
[emit]: ./emit.md
[state]: ./state.md
[waitfakeasync]: ./wait-fake-async.md

## List of all built-in Predicates

A predicate is a function that executes an operation on a given target. A test case can contain an arbitrary number of predicates that will be executed in the order they appear. The following list shows an overview on all built-in predicates. Please note that you can also write your own predicates, if there is a use case that is not covered by the built-in predicates.

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
