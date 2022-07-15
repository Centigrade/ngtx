## [🏠][home] &nbsp; → &nbsp; **Documentation** → &nbsp; Entities → &nbsp; `NgtxElement`

[home]: ../README.md
[getall]: ../helpers/get-all.md

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### Documentation: `NgtxMultiElement`
>
> The `NgtxMultiElement` is providing an improved API for multiple `NgtxElement`s. It gets returned by the [`getAll` helper][getall].

---

</details>

&nbsp;

The `NgtxElement` wraps Angular's `DebugElement` and provides a simple API for common testing tasks and scenarios. It gets returned whenever there is a result for a given query.

### `NgtxElement.nativeElement`

Returns the `nativeElement` of the inner, wrapped `debugElement`. This is useful whenever you need to access native features and APIs of the `NgtxElement`.

```ts
const inputText = get<HTMLInputElement>('input').nativeElement.value;
```

### `NgtxElement.componentInstance`

Returns the `componentInstance` of the inner `debugElement`. This is useful whenever you need to access the component instance of a `NgtxElement`.

```ts
const text = get(TextFieldComponent).componentInstance.text;
```

### `NgtxElement.injector`

Returns the `injector` instance of the inner `debugElement`. This is useful whenever you need to inject something from a given `NgtxElement`.

```html
<my-component myDirective></my-component>
```

```ts
const directiveInstance = get(MyComponent).injector.get(MyDirective);
```

### `NgtxElement.withApi(apiTemplate)`

> **Please Note:** This feature is designed to be useful for component harnesses that are described [in our guide for writing good tests][good-tests]. If you do not use component harnesses in your tests, you probably don't find this feature particularly useful.

Attaches the API of the passed class to the current element. This is useful when you need to attach functionality to your `NgtxElement` in a quick and easy way.

This feature makes it easy to build reusable component-harness APIs throughout your component tests. Also it provides additional ways to improve the readability of your test cases, since you can attach your own APIs with names that perfectly state what they do.

```ts
describe('TodoList', ngtx(({ get }) => {
  // skipped boilerplate testing code ...

  class Get {
    static TitleBar() {
      return get(TagComponent).withApi(TitleBarApi);
    }
  }

  class TitleBarApi extends NgtxElement {
    Label() {
      return this.get(".label");
    }
    Icon() {
      return this.get(IconComponent);
    }
  }

  it('should show the correct title and icon', () => {
    // arrange
    component.title = 'Shopping List';
    component.iconKey = 'cart';
    // act
    detectChanges();
    // assert
    const label = Get.TitleBar().Label();
    expect(label.textContent()).toEqual(component.title);
    const icon = Get.TitleBar().Icon();
    expect(icon.componentInstance.key).toEqual(component.iconKey);
  });
});
```

### `NgtxElement.get(query)`

Queries for the given target selector and returns the first match as result. This is useful when you need to query for a semantical part on a particular `NgtxElement`.

```ts
const dialogButtonLabel = get(ButtonComponent).get('.label');
expect(dialogButtonLabel.textContent()).toEqual('OK');
```

### `NgtxElement.getAll(query)`

Queries for the given target selector and returns all matches as array. This is useful when you need to find all instances of your query on a `NgtxElement`.

```ts
const tags = get(TagListComponent).getAll('.tag');
expect(tags.textContents()).toEqual(['Food', 'Healthy', 'Fruits']);
```

### `NgtxElement.attr(name, mapFn?)`

Returns the value of the specified attribute of the inner result. (Optionally) converts the value using the given mapFn.

```ts
import { get, asNumber /* ... */ } from '@centigrade/ngtx';

const age = get('.age-input').attr('value', asNumber);
```

### `NgtxElement.triggerEvent(name, eventArgs?)`

Triggers the specified event with the given `eventArgs` on the inner `debugElement`. The `eventArgs` argument can be left out; it defaults to `undefined` then.

```ts
get(TextFieldComponent).triggerEvent('textChange', 'new value');
```

### `NgtxElement.textContent(trim? = true)`

Returns the `textContent` property of the inner `debugElement.nativeElement`. Optionally takes an argument whether the text content should be automatically trimmed. If left out, this argument defaults to `true` (auto trimming enabled).

```html
<!-- component template -->
<my-label> label 1 </my-label>
```

```ts
const label = get(LabelComponent);
const text = label.textContent();
const withoutTrimming = label.textContent(false);

expect(text).toEqual('label 1');
expect(withoutTrimming).toEqual(' label 1 ');
```

### `NgtxElement.debug()`

Returns the `textContent` property of the inner `debugElement.nativeElement`.

```html
<!-- component template -->
<my-view>
  <my-expander [opened]="true">
    <div>This is the expander content</div>
  </my-expander>
</my-view>
```

```ts
// wild card css selector matches any first element, which in this
// case will be the root element of the test case:
get('*').debug();
/*
  prints the whole DOM of the test case to the console:

  <my-view>
    <my-expander ng-reflect-opened="true">
      <div>This is the expander content</div>
    </my-expander>
  </my-view>
*/
```

```ts
get(ExpanderComponent).debug();
/*
  prints only the DOM of the expander component incl. its children:

  <my-expander ng-reflect-opened="true">
    <div>This is the expander content</div>
  </my-expander>
*/
```

---
