## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveAttributes`

[home]: ../../README.md
[docs]: ../overview.md
[index]: ../built-in.md
[befound]: ./be-found.md
[bemissing]: ./be-missing.md
[containtext]: ./contain-text.md
[haveattributes]: ./have-attributes.md
[havecalled]: ./have-called.md
[havecssclass]: ./have-css-class.md
[haveemitted]: ./have-emitted.md
[havestate]: ./have-state.md
[havestyle]: ./have-style.md
[havetext]: ./have-text.md

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ haveAttributes ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) have the specified attributes on their `nativeElement`s.

> #### 💡 Checking the `componentInstance` rather than the `nativeElement`
>
> If you want to check for HTML attributes on the target's `componentInstance`, please refer to [haveState].

## Signature

```ts
haveAttributes(attrMap: PropertiesOf<Html> | PropertiesOf<Html>[]);
```

> where the type constraint `Html` is referring to the HTML-type of the object associated with this assertion.

## Examples

> ### Please Note
>
> In the following examples we use features from `jest` (e.g. `expect.stringContaining("...")`). If you use jasmine you will need jasmines equivalent of such features, but it will also work with them.

```ts
class the {
  static DropDownLabel() {
    return get('label');
  }
  static DropDownItems() {
    return getAll(DropDownItemComponent);
  }
}

it('[DropDownLabel] should have a tooltip showing the current value', () => {
  When(host)
    .has(state({ value: 'Credit Card' }))
    .expect(the.DropDownLabel)
    .to(haveAttributes({ title: 'Credit' }));
});

it('[DropDownItems] should all have a tooltip containing the word "Item"', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveAttributes({ title: expect.stringContaining('Item') }));
  // checking for 1 item -> do the single check for all items found -> ok!
  // checks all found drop-down-items if their title attribute's value contain "Item"
});

it('[DropDownItems] should have their values as tooltip', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(
      haveAttributes([
        { title: 'Item a' },
        { title: 'Item b' },
        { title: 'Item c' },
      ]), // checking for 3 -> ok!
    );
  // checks the first item for its title-attribute being "Item a",
  // the second for "Item b" and the third for "Item c".
});

it('you can skip single item checks by passing an empty object', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveAttributes([{}, { title: 'Item b' }, {}])); // checking for 3 -> ok!
  // checks only the second item, if its title attributes equals "Item b";
  // the first and third items won't be checked for anything
});

it('checking for more items than ngtx can find will throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(
      haveAttributes([
        { title: 'Item a' },
        { title: 'Item b' },
        { title: 'Item c' },
        { title: 'Item d' },
      ]), // checking for 4 items -> error
    );
});

it('checking for fewer items (but more than 1) than present in the template will also throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(
      haveAttributes([{ title: 'Item a' }, { title: 'Item b' }]), // checking for 2 items -> error
    );
});
```
