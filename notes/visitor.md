```ts
interface NgtxElement {
  get(query): NgtxElement;
  getAll(query): NgtxMultiElement;
  textContent(): string;
}

interface NgtxMultiElement {
  get(query): NgtxMultiElement;
  getAll(query): NgtxMultiElement;
  textContents(): string[];
}

interface NgtxMultiQuery {
  get(query): NgtxMultiQuery;
  getAll(query): NgtxMultiQuery;
  textContents(): string[];
  resolve(): NgtxMultiElement;
}

interface NgtxQuery {
  get(query): NgtxQuery;
  getAll(query): NgtxMultiQuery;
  textContent(): string;
  resolve(): NgtxElement;
}
```

```ts
class NgtxElement {}
class NgtxMultiElement {}
class NgtxQuery {}
class NgtxMultiQuery {}
```
