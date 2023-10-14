## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp;→ &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `debug`

[home]: ../README.md
[index]: ../built-in.md
[docs]: ../../DOCUMENTATION.md
[declarative]: ../index.md
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

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・ [call] ・ [clicked] ・ debug ・ [detectChanges] ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate prints out the test-DOM at the moment it gets called. Takes an optional configuration-parameter further adjusting its behavior.

## Signature

```ts
debug(opts?: DebugOptions);
```

### Interface `DebugOptions`

```ts
interface DebugOptions {
  stateOf?: TargetRef<HTMLElement, any>;
}
```

When passing the `stateOf` option, the predicate will additionally print out the component state of the target(s) passed.

## Examples

```ts
class the {
  static DropDownItem() {
    return get(DropDownItemComponent);
  }
}

it('should print out the DOM after setting DropDownItem state', () => {
  When(the.DropDownItem)
    .has(state({ value: 'Item 1' }))
    .and(debug()) // prints out DOM at this stage of the test
    .expect(the.DropDown)
    .to(haveState({ value: 'Item 1' }));
});

it('should additionally print out the drop-down-items component state', () => {
  When(the.DropDownItem)
    .has(state({ value: 'Item 1' }))
    .and(debug({ stateOf: the.DropDownItem })) // prints out DOM and component-state of DropDownItem
    .expect(the.DropDown)
    .to(haveState({ value: 'Item 1' }));
});
```
