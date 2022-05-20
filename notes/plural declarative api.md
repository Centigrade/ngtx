```ts
When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toCountUpTo(3);

When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toHaveState({ readonly: true });

When(host)
  .hasState({ items: [{}, {}, {}] })
  .expect(the.Items)
  .toHaveState([{ selected: true }, { selected: false }, { selected: false }]);
```
