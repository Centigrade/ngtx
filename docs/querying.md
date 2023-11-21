[home]: ../README.md
[overview]: ./overview.md
[addngtx]: ./add-ngtx.md
[builtins]: ./built-in.md
[extensionfns]: ./extending.md

# [🏠][home] &nbsp; → &nbsp; [Documentation][overview] &nbsp; → &nbsp; **Querying**

One core activity in testing is querying for html elements or child components (aka "**targets**") in the template
of the current component-under-test. Angular provides two basic functions to do that:

- `query()` and
- `queryAll()`

Both need a predicate function, which often is `By.css(selector)` or `By.directive(ComponentClass)`.

In many cases this function signature is not really handy, as you want to use either the `By.css` or `By.directive` predicate
in almost every case. ngtx fixes that by providing you an improved version of those two APIs:

- `get(targetDefinition)` and
- `getAll(targetDefinition)`

With ngtx' `get` and `getAll` API, you just skip the predicate and pass in your **target**-definition,
which may be of one of the following types:

- **CSS-Selector**: an arbitrary, valid css selector, e.g. `"button.primary"`
- **ComponentClass**: a component class e.g. `TextboxComponent`
- **ngtx-ID:** a ngtx ID, which you can learn more about in a following [chapter](#querying-by-ngtx-id), e.g. `"cart:item"`

## Why do I Need to Query Anything?

Since Angular components are a **composition** of different HTML elements and/or other components,
that interact with your component's code-logic, they are a crucial part of the intended component-behavior.
With tests, we want to make sure, that the interaction between the component-logic and its effects on
these elements (aka "**targets**") in the component's HTML template are exactly as we intend.

To do that, we need to get a reference to any **target** in the template we want, so that we can
for example simulate user-interactions (emit events) or run checks on them (e.g. assert bindings).

This can only be possible when we are able to query for certain targets in our component's template.

## Querying by CSS Selector

Querying by CSS is often done in presentational or custom input-components, as they tend to only use native, built-in elements.
One best practice when querying via a css-selector is to not target style-related attributes, such as classes. The purpose of classes is styling, not testing.
It's better to target tag-names, role attributes or similar. It is even better to add unique testing IDs to your elements as you can do with `ngtx-ID`s.
Also see [chapter "Querying by ngtx-ID"](#querying-by-ngtx-id).

> **textbox.component.html**

```html
<label *ngIf="label" [for]="uuid">{{ label }}</label>
<input
  [id]="uuid"
  [value]="text"
  (change)="textChange.emit($event.target.value)"
/>
```

> **textbox.component.spec.ts**

```ts
describe(
  'TextboxComponent',
  ngtx<TextboxComponent>(({ get }) => {
    // ...

    class the {
      static Label() {
        // here we query using a CSS selector:
        return get<HTMLLabelElement>('label');
      }
      static Input() {
        // here we query using a CSS selector:
        return get<HTMLInputElement>('input');
      }
    }

    // ...
  }),
);
```

## Querying by Component Class

Querying by component classes is often done in view components that are mostly reusing existing
components from your application. When targeting component classes there is a danger of being
ambiguous.

For example, imagine we're testing a dialog component, where there is only one `ButtonComponent` present, the submit button.
Now that you write your tests, you target that `ButtonComponent` and everything works just fine.
But after a while, requirements change, and you need to be able to parametrize what buttons are shown,
and there should also be the possibility to show an arbitrary number of buttons. This change might unnecessarily break your original test,
just because of the `ButtonComponent`-targeting. So best practise is to set unique testing-IDs to your **targets**, in order to
keep the tests as stable as possible.

> **dialog.component.html**

```html
<section>{{ dialogMessage }}</section>
<section>
  <my-dialog-button *ngFor="let button of buttons" (click)="close(button.type)">
    {{ button.label }}
  </my-dialog-button>
</section>
```

> **dialog.component.spec.ts**

```ts
describe(
  'DialogComponent',
  ngtx<DialogComponent>(({ getAll }) => {
    // ...

    class the {
      static Buttons() {
        // here we query using a component class:
        return getAll(DialogButtonComponent);
      }
    }

    // ...
  }),
);
```

## Querying by `ngtx-ID`

A ngtx ID is a unique string given to an element via `data-ngtx` attribute, that lets you safely target that element.
The ID-string must be unique across your component-under-test, better yet across all your components in your whole project.
That's why it's a good idea to prefix your ID with the component's name, e.g.:

> dialog.component.html

```html
<section data-ngtx="dialog:messageText">...</section>
<section data-ngtx="dialog:buttons">...</section>
```

This is the safest and most stable way to query the template for **targets**.
ngtx provides a shortcut for those queries. Testing IDs are attributes set on a element, whose sole purpose is
to make this specific element **targetable**.

Unlike css-classes, with testing IDs, nobody feels the need to change something on those attributes, unless
it's actually needed for the tests; as these attributes are completely irrelevant to any implementation
task. They really only exist for testing purposes. That's what makes them great for stable testing:

> **dialog.component.html**

```html
<section data-ngtx="dialog:messageText">...</section>
<section data-ngtx="dialog:buttons">...</section>
```

> **dialog.component.spec.ts**

```ts
describe(
  'DialogComponent',
  ngtx<DialogComponent>(({ get }) => {
    // ...

    class the {
      static Message() {
        // here we query using a ngtx-ID:
        return get('ngtx_dialog:messageText');
      }
      static Buttons() {
        // here we query using a ngtx-ID:
        return get('ngtx_dialog:buttons');
      }
    }

    // ...
  }),
);
```

### `ngtx-ID`s Aliases

Sometimes you want to group some **targets** via a common identifier, but still keep your ability to **target** them individually.
You can also use the ngtx-ID for that. A ngtx ID can be divided into several strings, that **combined** need
to be unique. This means that you can space-separate your ID parts and use the first part as a common identifier
and the second part as a individual identifier:

```html
<!-- data-ngtx="<common ID> <individual ID>": -->
<my-item data-ngtx="item 1">Item 1</my-item>
<my-item data-ngtx="item 2">Item 2</my-item>
<my-item data-ngtx="item 3">Item 3</my-item>

<!-- data-ngtx="<common ID> <individual ID>": -->
<my-button data-ngtx="button cancel">Cancel</my-button>
<my-button data-ngtx="button save">Save</my-button>
```

This way you can query for `ngtx_button` as well as e.g. `ngtx_button save`:

```ts
const allButtons = getAll('ngtx_button');
const save = get('ngtx_button save');
```

If you need to dynamically assign these ID aliases, you can do that via an attribute binding:

```html
<!-- use an [attr.]-binding to dynamically assign a ngtx ID. -->
<my-cart-item
  *ngFor="let product of cartItems"
  [attr.data-ngtx]="'cart:item ' + product.name"
/>
<!-- 
  don't forget the separating space (" ") character in the bound value:

    [attr.data-ngtx]="'cart:item ' + product.name"
          this space character ^^^
 -->
```
