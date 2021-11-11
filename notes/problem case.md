```ts
class NgtxElement {
  get(query): NgtxElement;
  getAll(query): NgtxMultiElement;
}
class NgtxMultiElement {
  get(query): NgtxMultiElement;
  getAll(query): NgtxMultiElement;
}
```

lazy loading:

```ts
it.each([
  // problem: gets instantly executed ...
  Get.HeaderRow().Column('name'),
  Get.HeaderRow().Column('age'),
])('should be present', (target) => {
  // ... but we need it to be lazy, something like:
  const element = target.resolve();
  expect(element).toBeDefined();
});
```

we would need something like:

```ts
class NgtxQuery {
  get(query): NgtxQuery;
  getAll(query): NgtxMultiQuery;
}
class NgtxMultiQuery {
  get(query): NgtxMultiQuery;
  getAll(query): NgtxMultiQuery;
}
```
