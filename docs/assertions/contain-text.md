## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `containText`

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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ containText ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) contain the specified text(s).

## Signature

```ts
containText(substrings: Maybe<string> | Maybe<string>[] | (index: number) => string);
```

| Overload | Parameter  | Type                               | Description                                                                                                                                                                                      |
| -------- | ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | substrings | `Maybe<string>`                    | The substring being expected to be found in the targets' `nativeElement` text content.                                                                                                           |
| 2        | substrings | `Maybe<string>[]`                  | An array of substrings expected to be found in the targets' `nativeElement`s text contents. The index of a substring in the array translates to the index of a target in the found targets list. |
| 3        | substrings | `(index: number) => Maybe<string>` | A function mapping the index of a target being found to a substring expected to be found in the target's `nativeElement`'s text content.                                                         |

### `type Maybe<T>`

```ts
type Maybe<T> = T | undefined | null;
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

> ## ⚠️ The number of text-definitions _must_ match the number of targets found when the test runs
>
> The only exception is the overload where you specify a single text-definition, that automatically applies to all found targets. Such as `containText('some text')`.
>
> For the overloads using arrays to specify text-requirements, the number of specified text-definitions must match the number of found targets in the test-run.
>
> This is a safety feature of ngtx in order to prevent a test being green, only because the assertion stopped iterating
> and thus not checking all the targets that were originally found.
