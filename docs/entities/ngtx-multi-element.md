## [🏠][home] &nbsp; → &nbsp; **Documentation** → &nbsp; Entities → &nbsp; `NgtxMultiElement`

[home]: ../README.md
[get]: ../helpers/get.md

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### Documentation: `NgtxElement`
>
> The `NgtxElement` is providing an improved API for the Angular built-in `DebugElement`. It gets returned by the [`get` helper][get].

---

</details>

## `NgtxMultiElement` API

The `NgtxMultiElement` wraps the results of a query that returns multiple matches. A classic example is the `getAll` helper, that returns all matches for a given query. The `NgtxMultiElement` has some convenience APIs, that shortcut the access to the inner elements (e.g. `attr` or `textContents`), while still providing basic array-like APIs such as `find` or `map`.

### `NgtxMultiElement.length`

Returns the number of inner results that the particular `NgtxMultiElement` instance holds.

### `NgtxMultiElement.get(query)`

Starts a query on each element that the `NgtxMultiElement` keeps wrapped inside itself and returns a concatenated list of results. This is useful when you need to query the same semantical part on similar or equal targets.

```ts
const dialogButtonLabels = getAll(ButtonComponent).get('.label');
expect(dialogButtonLabels.textContents()).toEqual(['Cancel', 'Retry']);
```

### `NgtxMultiElement.getAll(query)`

Similar to `NgtxMultiElement.get` but doesn't stop at the first match per wrapped element, but takes all matches into account. This is useful when you need all results for a semantical part on similar or equal elements.

```ts
// arrange
shoppingList.readOnly = true;
// act
detectChanges();
// assert
const allItemsActions = getAll(ShoppingListItemComponent).getAll([
  '.edit-btn',
  '.delete-btn',
]);
allItemsActions
  .attr('disabled')
  .forEach((disabled) => expect(disabled).toBeTruthy());
```

### `NgtxMultiElement.forEach(handler)`

> Provides the same behavior as the built-in javascript array method.

Allows you to iterate through the inner results in order to do something with them. Often useful to check every item for particular conditions.

```ts
it('[TextFields] should be initially empty', () => {
  // arrange, act, assert
  getAll(TextFieldComponent).forEach((field) =>
    expect(field.textContent()).toBe(''),
  );
});
```

### `NgtxMultiElement.find(findFn)`

> Provides the same behavior as the built-in javascript array method.

Allows you to iterate through the inner results and return the first item that matches your given condition.

```ts
const okButton = getAll(ButtonComponent).find(
  (button) => button.textContent() === 'OK',
);
```

### `NgtxMultiElement.filter(filterFn)`

> Provides the same behavior as the built-in javascript array method.

Allows you to filter all inner results based on a given condition.

```ts
const disabledButtons = getAll(ButtonComponent).filter(
  (button) => button.attr('disabled') != null,
);
```

### `NgtxMultiElement.map(mapFn)`

> Provides the same behavior as the built-in javascript array method.

Allows you to map each item to something other based on a conversion function.

```ts
const nativeElements = getAll(ButtonComponent).map(
  (button) => button.nativeElement,
);
```

### `NgtxMultiElement.first()`

Returns the first result or `null` if nothing was found.

```ts
const buttons = getAll(ButtonComponent);
expect(buttons.first().textContent()).toEqual('Cancel');
```

### `NgtxMultiElement.nth(count)`

Returns the nth result (_not index based!_) or `null` if the result list is empty.

```ts
const buttons = getAll(ButtonComponent);
expect(buttons.nth(1).textContent()).toEqual('First button');
expect(buttons.nth(3).textContent()).toEqual('Third button');
```

### `NgtxMultiElement.atIndex(index)`

Returns the result at the specified index or `null` if the result list is empty.

```ts
const buttons = getAll(ButtonComponent);
expect(buttons.atIndex(0).textContent()).toEqual('First button');
expect(buttons.atIndex(2).textContent()).toEqual('Third button');
```

### `NgtxMultiElement.last()`

Returns the last result or `null` if the result list is empty.

```ts
const buttons = getAll(ButtonComponent);
expect(buttons.last().textContent()).toEqual('OK');
```

### `NgtxMultiElement.attr(name, mapFn?)`

Returns the value of the specified attribute on each inner result. (Optionally) converts the values using the given mapFn.

```html
<!-- component template -->
<my-button [disabled]="true">Button 1</my-button>
<my-button>Button 2</my-button>
<my-button>Button 3</my-button>
```

```ts
it('should only disable the first button', () => {
  // arrange, act, assert
  const buttons = getAll(ButtonComponent);
  const disabledAttributes = buttons.attr('disabled', (value) =>
    Boolean(value),
  );
  expect(disabledAttributes[0]).toEqual(true);
  expect(disabledAttributes[1]).toEqual(false);
  expect(disabledAttributes[2]).toEqual(false);
});
```

### `NgtxMultiElement.textContents(trim? = true)`

Returns the `textContent` property of each inner result. Accepts an argument that allows you to opt-out from auto-trimming the text value. Trimming defaults to `true` when the argument is left out.

```html
<!-- component template -->
<my-label>label 1</my-label>
<my-label> label 2 </my-label>
```

```ts
it('should show the correct labels', () => {
  // arrange, act, assert
  const labels = getAll(LabelComponents);
  const texts = labels.textContents();
  const withoutTrimming = labels.textContents(false);

  expect(texts).toEqual(['label 1', 'label 2']);
  expect(withoutTrimming).toEqual(['label 1', ' label 2 ']);
});
```

### `NgtxMultiElement.withApi(apiTemplate)`

> **Please Note:** This feature is designed to be useful for component harnesses that are described [in our guide for writing good tests][good-tests]. If you do not use component harnesses in your tests, you probably don't find this feature particularly useful.

Attaches the API of the passed class to the current element. This is useful when you need to attach functionality to your `NgtxMultiElement` in a quick and easy way.

This feature makes it easy to build reusable component-harness APIs throughout your component tests. Also it provides additional ways to improve the readability of your test cases, since you can attach your own APIs with names that perfectly state what they do.

```ts
describe('TodoList', ngtx(({ getAll }) => {
  // skipped boilerplate testing code ...

  class Get {
    static AllTags() {
      return getAll(TagComponent).withApi(TagListApi);
    }
    static AddCurrentTagButton() {
      return get('.add-tag-button');
    }
  }

  class TagListApi extends NgtxMultiElement {
    Text() {
      return this.get(".label").textContent();
    }
  }

  it('should add the given tag to the tag list', () => {
    // arrange
    const expectedTagToBeAdded = "iOS";
    component.currentTag = expectedTagToBeAdded;
    detectChanges();
    // act
    Get.AddCurrentTagButton().triggerEvent('click');
    // assert
    // the "contains" method is the attached API
    // that comes from TagListApi class:
    const tagTexts = Get.AllTags().Text(); // -> ["iOS"]
    expect(tagTexts).toContain(expectedTagToBeAdded);
  });
});
```

### `NgtxMultiElement.triggerEvent(name, eventArgs?)`

Triggers the specified event with the given `eventArgs` on each inner result. The `eventArgs` argument can be left out; it defaults to `undefined` then.

```ts
// arrange
spyOn(component.valueChange, 'emit');
component.disable = true;
detectChanges();
// act: emit the "executeAction" event on all actions
getAll(ActionComponent).triggerEvent('executeAction', { name: 'dummy-action' });
// assert
expect(component.valueChange.emit).not.toHaveBeenCalled();
```

### `NgtxMultiElement.unwrap()`

Returns the inner results list.

```ts
const actions = getAll(ActionComponent);
const innerArray = actions.unwrap();
// assert
expect(innerArray.length).toEqual(actions.length);
expect(Array.isArray(actions)).toBe(false);
expect(Array.isArray(innerArray)).toBe(true);
```
