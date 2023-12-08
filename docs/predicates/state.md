## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp;→ &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `state`

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

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・[call] ・[clicked] ・[debug] ・[detectChanges] ・[emit] ・ [provider] ・state ・[waitFakeAsync]

---

This predicate sets the specified component state(s) on its associated target(s) and runs change detection afterwards.

## Signature

```ts
state(propertyMap: PropertiesOf<Component> | PropertiesOf<Component>[]);
```

> where the type constraint `Component` is referring to the component-type of the subject associated with this predicate.

## Example

```ts
class the {
  static GreetingLabel() {
    return get('h2');
  }
  static PaymentOptions() {
    return getAll(ToggleButtonComponent);
  }
  static BuyButton() {
    return getAll(ToggleButtonComponent);
  }
}

it('should render the correct welcome message', () => {
  When(host)
    .has(state({ userName: 'Ann' }))
    .expect(the.GreetingLabel)
    .to(haveText('Welcome Ann!'));
});

it('should submit a valid person object when the form is valid', () => {
  When(the.PaymentOptions)
    .have(
      state([
        // 1) debit, 2) paypal, 3) cash
        { selected: true },
        { selected: false },
        { selected: false },
      ]),
    )
    .and(the.BuyButton)
    .gets(clicked())
    .expect(host)
    .to(haveCalled(injected(DebitService), 'initPayment'));
});
```
