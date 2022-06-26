## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Helpers][index] &nbsp;→ &nbsp; [Predicates][index] &nbsp; → &nbsp; `emit`

[home]: ../README.md
[index]: ./index.md
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

Quick Navigation: &nbsp; [attributes] ・ [callLifeCycleHook] ・[call] ・[clicked] ・[debug] ・[detectChanges] ・emit ・[state] ・[waitFakeAsync]

---

This predicate emits an event on the target(s) associated with it. It optionally takes a configuration parameter which allows to further adjust its behavior.

## Signature

```ts
emit(eventNameOrDispatcher?: Events<Html, Component> | EventDispatcher, arg?: any);
```

> where the type constraint `Html` and `Component` refers to the HTML- and component-type of the subject associated with this predicate.

> ## Please Note
>
> the `emit` predicate is one of the few predicates that is additionally baked into ngtx' base api; so
> the following code example are doing one and the same thing:
>
> ```ts
> When(the.DropDown)
>   .does(emit('valueChange', 'Item 1'))
>   .expect(host)
>   .to(haveState({ value: 'item 1' }));
> ```
>
> and:
>
> ```ts
> When(the.DropDown)
>   .emits('valueChange', 'Item 1')
>   .expect(host)
>   .to(haveState({ value: 'item 1' }));
> ```
>
> This was done in order to improve the readability for this very common use case.

## Examples

```ts
import { state, emit, nativeEvent } from '@centigrade/ngtx';

class the {
  static Input() {
    return get('input');
  }
  static SearchButton() {
    return get(ButtonComponent);
  }
}

it('should apply the value of the drop-down when it emits the valueChange event', () => {
  When(the.DropDown)
    .emits('valueChange', 'Item 1')
    .expect(host)
    .to(haveState({ value: 'item 1' }));
});

it('should update the text on input event', () => {
  When(host)
    .has(state({ searchText: '' }))
    .and(the.Input)
    .emits(nativeEvent('input', new KeyboardEvent({ key: 'x' })))
    .expect(host)
    .to(haveState({ searchText: 'x' }));
});
```
