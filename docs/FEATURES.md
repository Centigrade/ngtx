# Feature Overview

This article gives a quick overview on the main features of ngtx.

<details>
  <summary>🧭 &nbsp;<b>Not what you are looking for?</b></summary>

> ### Trying to get started with ngtx?
>
> You may want to visit our [first steps page][firststeps].
>
> ### Want to read about the whole API?
>
> You may want to visit our [API documentation][api].
>
> Or navigate back [home][home].

---

</details>

## Simpler Change Detection

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

## Finding Relevant Elements Easier

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

---

## Easier Triggering of Events

Triggering an event in Angular is quite easy. But there are a few points that could be improved. The first thing is, that you need to pass an event-args argument, even if no one is needed:

`debugElement.triggerEventHandler('click', undefined);`

It's not a big deal, but doing it over and over again makes you feel like "this should be fixed". Another (also really small) point is that, the name could be a bit shorter. Renaming it to `triggerEvent` would not change the semantics of the method too much, and any developer would still understand what this function is doing. So we decided to improve these points by introducing the `triggerEvent` helper function:

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

## Easy Attribute Retrieval

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

## Easier Access to Element's Text Content

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

## HTML Output Debugging

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

[api]: ./DOCUMENTATION.md
[firststeps]: ./FIRST_STEPS.md
[good-tests]: ./GOOD_TESTS.md
[home]: ../README.md
