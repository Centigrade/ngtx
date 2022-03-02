## [🏠][home] &nbsp; → &nbsp; **Feature Overview**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### First Steps
>
> You may want to visit our [first steps page][firststeps].
>
> ### API Documentation
>
> You may want to visit our [API documentation][api].

---

</details>

&nbsp;

This article gives a quick overview on the main features of ngtx.

> Click the features listed below to show their details.

<details>
  <summary>Simpler Change Detection</summary>

## `detectChanges`-helper

Save the `fixture.`-prefix and simply write what you want to do:

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

---

</details>

<details>
  <summary> Finding Relevant Elements Easier </summary>

## Shortcut Element Queries

Often in Angular tests we need to get hold of elements, we want to inspect further. With Angular this is quite verbose, as there are two major search strategies, that needs to be imported first (`By.css` and `By.directive` from `@angular/platform-browser`).

Also, the returned `DebugElement`'s types are impractical for most use cases, as both, its `componentInstance` and `nativeElement` is of type `any`.

With ngtx' `get` helper you simply write down your query and get your types for free, since all helpers return an improved version of the debug element, simply called `TypedDebugElement`:

### Using the `get` Helper

Searches an element either by CSS or a ComponentType and returns the first match.

> It's like `debugElement.query(...)` but more useful.

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, get }) => {
    // ...

    it('should find my elements easily by css and directive', () => {
      // arrange, act
      const button = get('button.active');
      const myComponent = get(MyComponent);

      // assert
      expect(button).toBeDefined();
      expect(myComponent).toBeDefined();
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

Sometimes you may need to get the first result of a range of queries. In such cases you can simply pass multiple queries to the `get` helper:

```ts
const firstFormField = get<HTMLElement>(['input', MarkDownEditorComponent]);
firstFormField.nativeElement.focus();
```

### Using the `getAll` Helper

Searches elements by either CSS or ComponentType and returns all matching elements.

> It's like `debugElement.queryAll(...)` but more useful.

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, getAll }) => {
    // ...

    it('should find my elements easily by css and directive', () => {
      // arrange, act
      const buttons = getAll('button.active');
      const myComponents = getAll(MyComponent);

      // assert
      expect(Array.isArray(buttons)).toBe(true);
      expect(Array.isArray(myComponents)).toBe(true);
    });
  }),
);
```

Sometimes it's necessary to execute multiple queries to get all relevant elements for your current test. In these cases you can use `getAll` with multiple queries:

```ts
const allButtons = getAll(['.button-secondary', '.button-primary']);
```

### Semantical Parts

With ngtx you can add a special `data-ngtx="<semantic-name>"` HTML-attribute on important parts in your component-template. Together with [component testing harnesses][good-tests] this will further increase the semantics and robustness of your test cases, as it prevents more breaking changes when restructuring the component under test.

Using the `get` and `getAll` helpers you can find these template-parts easily by using queries formatted like this: `ngtx_<sematic-name>` (the `ngtx_` prefix tells ngtx to query for semantical parts).

**Example**

Let's imagine we are creating a user-item component showing the profile picture, name and email of a given user. The component-template could look something like this:

```html
<!-- user-item-component template -->
<section class="rounded-avatar">
  <!-- 
    the next element is something we want to test; so we give it
    a semantical name via the data-ngtx attribute:
  -->
  <img [src]="user.imgUrl" data-ngtx="user-item:avatar" />
</section>
<section>
  <span data-ngtx="user-item:name">{{ user.name }}</span>
  <span data-ngtx="user-item:email">{{ user.email }}</span>
</section>
```

Now we want to test this component and use the semantical parts specified via the `data-ngtx` attribute. The tests can query these parts like that:

```ts
it('should show the correct profile picture in the avatar img', () => {
  // arrange
  component.user = {
    name: 'Ann',
    email: 'annie@something.com',
    imgUrl: './some-picture.jpg',
  };
  // act
  detectChanges();
  // assert
  // here we're using the semantical part query:
  expect(get('ngtx_user-item:avatar').attr('src')).toEqual(
    component.user.imgUrl,
  );
});

// you can even parametrize tests, that are otherwise structurally
// the same. In jest, you would use the it.each feature for this:
[
  ['ngtx_user-item:name', 'name'],
  ['ngtx_user-item:email', 'email'],
].forEach(([semanticPart, propertyName]) => {
  it(`should show the correct ${propertyName}`, () => {
    // arrange
    component.user = {
      name: 'Ann',
      email: 'annie@something.com',
      imgUrl: './some-picture.jpg',
    };
    // act
    detectChanges();
    // assert
    // here we're using the semantical part query:
    const textOfSemanticPart = get(semanticPart).textContent();
    expect(textOfSemanticPart).toEqual(component.user[propertyName]);
  });
});
```

Whenever the HTML structure of the user-item component would change, you can easily move the `data-ngtx` semantical part attribute to the new element with the respective role. This way none of the existing tests needs to be touched - they still work as expected.

> ### Please Note
>
> Of course the new element that replaces the old one must be compatible with the old element's API. If that is not the case, the tests might break at these incompatible APIs.

> ### Prefixing Semantical Parts is a Best Practice
>
> It is considered best practice to prefix your semantical part names with the component name, e.g.:
>
> ```html
> <!-- user-item-component template -->
> <span data-ngtx="user-item:name">{{ user.name }}</span>
> ```
>
> This will prevent name-collisions in components, that uses other components also containing the same semantical-part names.

---

</details>

<details>
  <summary> More Practical Event Emitting </summary>

## Easier Triggering of Events

Triggering an event in Angular is quite easy. But there are a few points that could be improved. The first thing is, that you need to pass an event-args argument, even if no one is needed and another point is that the name could be a bit shorter.

Angular: `debugElement.triggerEventHandler('click', undefined);`

ngtx: `get('button').triggerEvent('click');`

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, get }) => {
    // skipping boilerplate test code...

    it('should easily trigger events on desired elements', () => {
      // arrange
      spyOn(component.myEvent, 'emit');

      // without event args:
      get(MyComponent).triggerEvent('myEvent');
      // with event args 42:
      get('.some-css-selector').triggerEvent('myEvent', 42);

      // assert
      expect(component.myEvent.emit).toHaveBeenCalledTimes(2);
      expect(component.myEvent.emit).toHaveBeenCalledWith(42);
    });
  }),
);
```

---

</details>

<details>
  <summary> Easy Attribute-Value Retrieval </summary>

## Making Attribute-Value Retrieval More Understandable

In Angular it can easily become confusing when you are about to test the existence or values of attributes on elements. E.g. Angular distinguishes between `attributes` and `properties`. Also sometimes you'll need to prefix your attribute's name with `"html"`, in order to get the desired result.

To make things easier for you, this package introduce a new `attr`-helper function, which uses the native `getAttribute()` function under the hood. This helps keeping consistent and predictable results for intuitive inputs.

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, get }) => {
    // ...

    // old-school:
    it('should set the correct input-id as label-for attribute', () => {
      // arrange
      const input = fixture.debugElement.query(By.css('input'));
      const label = fixture.debugElement.query(By.css('label'));

      // act, assert
      expect(label.properties.htmlFor).toEqual(input.properties.id);
    });

    // becomes now:
    it('should set the correct input-id as label-for attribute', () => {
      // arrange, act, assert
      expect(get('label').attr('for')).toEqual(get('input').attr('id'));
    });
  }),
);
```

In cases you want to work with the values of an attribute, you'll need to know that the result of `attr` is always a string per default. This way, a boolean value will be the string `"true"` as a result. If you want to cast or parse the attribute's value-string, you can make use of the optional, second parameter which accepts a conversion function:

```ts
import { asBool, asNumber /* ... */ } from '@centigrade/ngtx';

expect(get('button').attr('disabled', asBool)).toBe(true);
expect(get('button').attr('counter', asNumber)).toBe(42);
```

---

</details>

<details>
  <summary> Easier Access to Element's Text Content </summary>

## `.textContent()`

In order to get the text content of an element, you'll need to gather its `debugElement` first, to have then access to the `debugElement.nativeElement` in order to finally read the `nativeElement.textContent` property. To shortcut this, you can use `textContent`-helper function:

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture, get }) => {
    // ...

    it('should return the text content of an element', () => {
      // arrange
      const content1 = get('button.active').textContent();
      const content2 = get(TabItem).textContent();

      // act, assert
      expect(content1).toEqual('text of button.active');
      expect(content2).toEqual('text of TabItem');
    });
  }),
);
```

---

</details>

<details>
  <summary> HTML-Output Debugging </summary>

## `.debug()`

We all know it. Sometimes you're lost with a failing test case and don't even know what's happening there. In these cases it's often helpful to see the actual HTML, rendered by the test case. But there's no easy way to print out the HTML tree to the console.

Now there is. With `debug` you can print the HTML-tree that your test case produces right into your console:

```ts
describe(
  'MyTestSuite',
  ngtx(({ useFixture }) => {
    // ...

    it('should help you find the bugs in your tests', () => {
      // arrange, act, assert, doesn't work:
      expect(textContent('input.my-input')).toEqual(component.text);

      // debug to the help:
      get('.input-container').debug();

      /*
          prints to console:

          <div class="input-container active">
            <input class="my-input" value="expected-text"></input>
          </div>

          We now may realize that there is no textContent of course,
          as our targeted element is an input, which rather has a
          value property, we need to query.
      */
    });
  }),
);
```

> **Please note:** You may want to initialize syntax-highlighting in order to enable colored output in compatible consoles. To do so, import and call the `initSyntaxHighlighting` function from ngtx in your test-environment setup file:

```ts
// file: "src/test.ts" or "setupJest.ts"
import { initSyntaxHighlighting } from '@centigrade/ngtx';

initSyntaxHighlighting();
```

> Real screenshot:
>
> ![Console log output](./media/debug-output.png)

</details>

[api]: ./DOCUMENTATION.md
[firststeps]: ./FIRST_STEPS.md
[good-tests]: ./GOOD_TESTS.md
[home]: ../README.md
