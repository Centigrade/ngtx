## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `containText`

[home]: ../README.md
[docs]: ../overview.md
[declarative]: ../index.md
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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ containText ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) contain the specified text(s).

## Signature

```ts
containText(expectedSubstring: string);
```

## Examples

```ts
class the {
  static DropDownLabel() {
    return get('label');
  }
  static DropDownItems() {
    return getAll(DropDownItemComponent);
  }
}

it('[DropDownLabel] should contain the current value as text', () => {
  When(host)
    .has(state({ value: 'Credit Card' }))
    .expect(the.DropDownLabel)
    .to(containText('Credit'));
});

it('[DropDownItems] should all contain the word "Item"', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(containText('Item')); // checking for 1 item -> do the single check for all items found -> ok!
  // checks all found drop-down-items if they contain "Item"
});

it('[DropDownItems] should contain their specific identifiers', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(containText(['a', 'b', 'c'])); // checking for 3 -> ok!
  // checks the first item to contain "a", the second for "b" and the third for "c".
});

it('you can skip single item checks by passing undefined', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(containText([undefined, 'b', undefined])); // checking for 3 -> ok!
  // checks only the second item, if it contains "b";
  // the first and third items are allowed to have any text
});

it('checking for more items than ngtx can find will throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(containText(['a', 'b', 'c', 'd'])); // checking for 4 items -> error
});

it('checking for fewer items (but more than 1) than present in the template will also throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(containText(['a', 'b'])); // checking for 2 items -> error
});
```
