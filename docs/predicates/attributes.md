## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `attributes`

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

Other Predicates: &nbsp; attributes ・ [callLifeCycleHook] ・ [call] ・ [clicked] ・ [debug] ・ [detectChanges] ・ [emit] ・ [provider] ・ [state] ・ [waitFakeAsync]

---

This predicate sets the specified attribute(s) on its associated target(s) and runs change detection afterwards.

## Signature

```ts
attributes(attrMap: PropertiesOf<Html> | PropertiesOf<Html>[]);
```

> where the type constraint `Html` is referring to the HTML-type of the subject associated with this predicate.

## Example

```ts
class the {
  static NameInput() {
    return get<HTMLInputElement>('input');
  }
  static Inputs() {
    return getAll<HTMLInputElement>('input');
  }
  static SubmitButton() {
    return get('.btn-submit');
  }
}

it('should clear the name-input text on clear-button click', () => {
  When(the.NameInput)
    .has(attributes<HTMLInputElement>({ value: 'some text' }))
    .and(host)
    .calls(componentMethod, 'clearText')
    .expect(the.NameInput)
    .to(haveAttributes({ value: '' }));
});

it('should submit a valid person object when the form is valid', () => {
  When(the.Inputs)
    .have(
      attributes<HTMLInputElement>([
        { value: 'Ann' },
        { value: 'Smith' },
        { value: '42' },
      ]),
    )
    .and(the.SubmitButton)
    .gets(clicked())
    .expect(host)
    .to(
      haveEmitted('finish', {
        arg: { firstName: 'Ann', lastName: 'Smith', age: 42 },
      }),
    );
});
```
