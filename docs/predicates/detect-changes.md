## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp;→ &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `detectChanges`

[home]: ../README.md
[index]: ../built-in.md
[docs]: ../overview.md
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

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・[call] ・ [clicked] ・ [debug] ・ detectChanges ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate runs change detection. It optionally takes a configuration parameter which allows to further tweak its behavior.

## Signature

```ts
detectChanges(opts?: DetectChangesOptions);
```

### Interface `DetectChangesOptions`

```ts
interface DetectChangesOptions {
  viaChangeDetectorRef?: boolean;
}
```

When setting viaChangeDetectorRef to `true`, this predicate will use the `ChangeDetectorRef` of the target(s) to enforce change detection. This is especially useful when the component-under-test uses `ChangeDetectionStrategy.OnPush`.

## Examples

```ts
class the {
  static OnlineStatusIcon {
    return get(IconComponent);
  }
}

it('should show the online-state as icon', () => {
  When(host) // uses OnPush change-detection
    .has(state({ online: false }))
    .and(detectChanges({ viaChangeDetectorRef: true }))
    .expect(the.OnlineStatusIcon)
    .to(haveState({ icon: 'offline' }));
});
```
