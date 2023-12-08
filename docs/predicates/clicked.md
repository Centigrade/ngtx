## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `clicked`

[home]: ../README.md
[docs]: ../overview.md
[index]: ../built-in.md
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

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・ [call] ・ clicked ・ [debug] ・ [detectChanges] ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate either emits a "click" event on the target(s) or calls the click-method on the target(s)' native element; then running change detection afterwards. The exact behavior can be controlled via parameter.

## Signature

```ts
clicked(opts?: ClickOptions);
```

### Interface `ClickOptions`

```ts
interface ClickOptions {
  times?: number;
  nativeClick?: boolean;
}
```

## Examples

```ts
class the {
  static DropDownItem() {
    return get(DropDownItemComponent);
  }
}

it('should set the item-value as value of the drop-down when clicking on it', () => {
  When(the.DropDownItem)
    .has(state({ value: 'Item 1' }))
    .and(the.DropDownItem)
    .gets(clicked())
    .expect(the.DropDown)
    .to(haveState({ value: 'Item 1' }));
});

it('should set the item-value as value of the drop-down when natively clicking on it', () => {
  When(the.DropDownItem)
    .has(state({ value: 'Item 1' }))
    .and(the.DropDownItem)
    .gets(clicked({ nativeClick: true }))
    .expect(the.DropDown)
    .to(haveState({ value: 'Item 1' }));
});
```

```ts
class the {
  static ValueLabel() {
    return get('p');
  }
  static CountUpButton() {
    return get('.btn-up');
  }
}

it('should count up the value by 1 for each click', () => {
  When(host)
    .has(state({ result: 0 }))
    .and(the.CountUpButton)
    .gets(clicked({ times: 2 }))
    .expect(the.ValueLabel)
    .to(haveText('2'));
});
```
