```ts
When(host) // configures next state call in terms of generic type
  .has(state({ disabled: true }))
  .expect(the.Items) // configures next state call in terms of generic type
  .to(haveState([{ disabled: true }, { disabled: false }]));
```

When and expect are the only functions that need to configure the next fn-generics.
We do not need to track down the total test-state at every stage. This would
simplify types.

```ts
function state<Html extends HTMLElement, Type>(
  props: Partial<Type>,
): StateFn<Html, Type> {
  return (
    target: MultiPartRef<Html, Type>,
    state: TestState,
    fixture: NgtxFixture,
  ) => {
    return {
      predicate: () => {
        // how to decide between multi part and single part?
        const targetInst = target().componentInstance;
        targetInst[key] = value;
        fixture.detectChanges();
      },
    };
  };
}

function haveState() {
  return (target: MultiPartRef<Html, Type>) => {
    return {
      assertion: () => {
        const targetInst = target().componentInstance;

        if (state.negateAssertion) {
          expect(/*...*/).not.toEqual(/*...*/);
        } else {
          expect(/*...*/).not.toEqual(/*...*/);
        }
      },
    };
  };
}
```
