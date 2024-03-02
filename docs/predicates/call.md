## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `call`

[home]: ../README.md
[index]: ../built-in.md
[docs]: ../overview.md
[attributes]: ./attributes.md
[calllifecyclehook]: ./call-life-cycle-hook.md
[call]: ./call.md
[clicked]: ./clicked.md
[debug]: ./debug.md
[detectchanges]: ./detect-changes.md
[emit]: ./emit.md
[provider]: ./provider.md
[state]: ./state.md
[waitfakeasync]: ./wait-fake-async.md

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・ call ・ [clicked] ・ [debug] ・ [detectChanges] ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate resolves the call-target using the given `TargetResolver`, then calls the specified method and runs change detection afterwards.

## Signature

```ts
call(resolver: TargetResolver<Html, Component, Target>, methodName: keyof Target, args?: any[]);
```

> where the type constraint `Html` and `Component` refers to the HTML- and component-type of the subject associated with this predicate; and the `Target` constraint determines the target-type that is resolved by the passed `TargetResolver`.

> ## Please Note
>
> the `call` predicate is one of the few predicates that is additionally baked into ngtx' base api; so
> the following code example are doing one and the same thing:
>
> ```ts
> When(host)
>   .does(call(componentMethod, 'open'))
>   .expect(host)
>   .to(haveState({ open: true }));
> ```
>
> and:
>
> ```ts
> When(host)
>   .calls((componentMethod, 'open'))
>   .expect(host)
>   .to(haveState({ open: true }));
> ```
>
> This was done in order to improve the readability for this very common use case.

## Examples

```ts
import {
  state,
  call,
  injected,
  haveState,
  componentMethod,
} from '@centigrade/ngtx';

class the {
  static DropDownItem() {
    return get(DropDownItemComponent);
  }
}

it('should set the item-value as value of the drop-down when calling activate on it', () => {
  When(the.DropDownItem)
    .has(state({ value: 'Item 1' }))
    .and(call(componentMethod, 'activate')) // calls activate on the DropDownItem
    .expect(the.DropDown)
    .to(haveState({ value: 'Item 1' }));
});
```

```ts
import {
  state,
  call,
  injected,
  haveState,
  haveEmitted,
  nativeMethod,
} from '@centigrade/ngtx';

it('[RadioButton] should be selected after calling RadioGroup.select', () => {
  When(host)
    .has(state({ selected: false, value: 'Item 1' }))
    .and(call(injected(RadioGroupService), 'select', ['Item 1']))
    .expect(host)
    .to(haveState({ selected: true }));
});

it('[ContextMenu] should emit the close event on blur', () => {
  When(host).calls(nativeMethod, 'blur').expect(host).to(haveEmitted('close'));
});
```
