## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `callLifeCycleHook`

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

Other Predicates: &nbsp; [attributes] ・ callLifeCycleHook ・ [call] ・ [clicked] ・ [debug] ・ [detectChanges] ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate calls the specified Angular life-cycle-hooks on its target(s) and runs change detection afterwards.

## Signature

```ts
callLifeCycleHook(opts?: LifeCycleHookCalls<Component>);
```

> where the type constraint `Component` is referring to the component-type of the subject associated with this predicate.

### Interface `LifeCycleHookCalls`

```ts
interface LifeCycleHookCalls<Component> {
  ngOnInit?: boolean;
  ngOnChanges?: boolean | PropertiesOf<Component>;
  ngAfterViewInit?: boolean;
  ngOnDestroy?: boolean;
}
```

## Example

```ts
class the {
  static WelcomeLabel() {
    return get('h2');
  }
}

it('should show the correct welcome message onChanges', () => {
  When(host)
    .has(state({ firstName: 'Ann', lastName: 'Smith' }))
    .and(callLifeCycleHook({ ngOnChanges: { firstName: true } }))
    .expect(the.WelcomeLabel)
    .to(haveText('Welcome Ann Smith!'));
});

it('should destroy its data-service onDestroy', () => {
  When(host)
    .does(callLifeCycleHook({ ngOnDestroy: true }))
    .expect(host)
    .to(haveCalled(injected(DataService), 'destroy'));
});
```
