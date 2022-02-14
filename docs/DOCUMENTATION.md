# API Documentation

ngtx contains a set of small helper functions enabling you to write your tests with ease while becoming precise and readable throughout your test-cases. This documentation iterates through all helpers currently available in ngtx and explains when and how to use them.

<details>
  <summary>🧭 &nbsp;<b>Not what you are looking for?</b></summary>

> ### Don't know where to start?
>
> For those who are new to Angular application testing with ngtx, we recommend to start with the [first steps article][firststeps]. After this article you should be good to go with the examples in this article. This article primarily targets developers that already know ngtx or at least have experience with writing Angular tests.
>
> ### Need examples?
>
> You find a bunch of examples in [this article][examples].
>
> Or navigate back [home][home].

---

</details>

> **Please Note:** Most of the examples use JavaScript's [object destructuring][mdn.destructuring] syntax. If you are not familiar with it, we encourage you to quickly look it up for a better understanding of the given code examples.

## `detectChanges` Helper

> This helper provides quick and easy change detection

Save the `fixture.`-prefix and simply write what you want to say:

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, detectChanges }) => {
    // ...

    it('should save you some key strokes to detect changes', () => {
      // arrange
      component.someProp = 42;

      // act
      detectChanges();

      // assert
      expect(component.someProp).toBe(42);
    });
  }),
);
```

As a small bonus: Sometimes you need to have your life-cycle-hooks being run before the change-detection is done. In that case simply pass your component as an argument:

```ts
// runs ngOnChanges and ngOnInit life-cycle-hooks (if defined) on component and then detectChanges:
detectChanges(component);
```

You can also provide an object that should be passed into the `ngOnChanges` life-cycle hook:

```ts
// if your component looks like that:
class MyComponent {
  // @Inputs skipped ...

  ngOnChanges(changes: SimpleChanges) {
    if (changes.label) {
      /* do something */
    }
  }
}

// you can trigger the label-changed-logic in your tests like that:
detectChanges(component, {
  // you can pass a simple boolean or any other truthy value;
  // of course you can also pass a real SimpleChange object
  label: true,
});
```

## `get` Helper

Searches an element either by CSS or a ComponentType and returns the first match as a `NgtxElement`. This type provides some extra APIs, that help you with common tasks and scenarios when it comes to testing.

> It's like `debugElement.query(...)` but more useful.

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, get }) => {
    // ...

    it('should easily find my elements by css and directive', () => {
      // arrange, act
      const button = get('button.active');
      const myComponent = get(MyComponent);
      // to get the instance of a directive, we need to use
      // the dependency injection to get the correct reference:
      const myDirective = get(MyDirective).injector.get(MyDirective);

      // assert
      expect(button).toBeDefined();
      expect(myComponent).toBeDefined();
      expect(myDirective).toBeDefined();
    });

    it('should get practical types', () => {
      // nativeElement is now of type Element per default:
      const { nativeElement } = get('button.active');

      // nativeElement is of type HTMLInputElement here:
      const { nativeElement } = get<HTMLInputElement>('.my-input');

      // componentInstance is now of type MyComponent
      const { componentInstance } = get(MyComponent);
    });
  }),
);
```

---

## `NgtxElement` API

The `NgtxElement` wraps Angular's `DebugElement` and provides a simple API for common testing tasks and scenarios. It gets returned whenever there is a result for a given query.

### `NgtxElement.nativeElement`

Returns the `nativeElement` of the inner, wrapped `debugElement`. This is useful whenever you need to access native features and APIs of the `NgtxElement`.

```ts
const inputText = get<HTMLInputElement>('input').nativeElement.value;
```

### `NgtxElement.nativeElement`

Returns the `nativeElement` of the inner `debugElement`. This is useful whenever you need to access native features and APIs of the `NgtxElement`.

```ts
const inputText = get<HTMLInputElement>('input').nativeElement.value;
```

### `NgtxElement.componentInstance`

Returns the `componentInstance` of the inner `debugElement`. This is useful whenever you need to access the component instance of a `NgtxElement`.

```ts
const text = get(TextFieldComponent).component.text;
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
import { get, asNumber /* ... */ } from '@Centigrade/ngtx';

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

[mdn.destructuring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring
[examples]: ./EXAMPLES.md
[firststeps]: ./FIRST_STEPS.md
[good-tests]: ./GOOD_TESTS.md
[home]: ../README.md
