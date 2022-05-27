```ts
When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toCountUpTo(3);

When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toHaveStates({ readonly: true });

When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toHaveStates([{ selected: true }, { selected: false }, { selected: false }]);
```
