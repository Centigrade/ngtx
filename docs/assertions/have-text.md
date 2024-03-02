## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveText`

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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ haveText

---

This assertion checks if its associated target(s) have the specified text as `textContent` on their `nativeElement`.

## Signature

```ts
haveText(texts: Maybe<string> | Maybe<string>[] | (index: number) => string)
```

| Overload | Parameter | Type                               | Description                                                                                                                                                                                 |
| -------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | texts     | `Maybe<string>`                    | The text being expected as the targets' `nativeElement` text content.                                                                                                                       |
| 2        | texts     | `Maybe<string>[]`                  | An array of texts defining what is expected on the targets' `nativeElement`s text contents. The index of a text in the array translates to the index of a target in the found targets list. |
| 3        | texts     | `(index: number) => Maybe<string>` | A function mapping the index of a target being found to its expected `nativeElement`'s text content.                                                                                        |

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

it('[DropDownLabel] should have the current value as text', () => {
  When(host)
    .has(state({ value: 'Credit Card' }))
    .expect(the.DropDownLabel)
    .to(haveText('Credit Card'));
});

it('[DropDownItems] should have their specific identifiers as text', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveText(['Item a', 'Item b', 'Item c']));
  // checking for 3 texts -> ok!
});

it('[DropDownItems] should have their specific identifiers as text', () => {
  When(host)
    .has(state({ items: ['Item 0', 'Item 1', 'Item 2'] }))
    .expect(the.DropDownItems)
    .to(haveText((index) => `Item ${index}`));
});

it('you can skip single item checks by passing undefined', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveText([undefined, 'Item b', undefined]));
  // checking for 3 texts -> ok!
  // checks only the second item, if it contains "b";
  // the first and third items are allowed to have any text
});

it('checking for more items than ngtx can find will throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveText(['Item a', 'Item b', 'Item c', 'Item d'])); // checking for 4 items -> error
});

it('checking for fewer items (but more than 1) than present in the template will also throw an error', () => {
  When(host)
    .has(state({ items: ['Item a', 'Item b', 'Item c'] })) // 3 items
    .expect(the.DropDownItems)
    .to(haveText(['Item a', 'Item b'])); // checking for 2 items -> error
});
```

> ## ⚠️ The number of text-definitions _must_ match the number of targets found when the test runs
>
> The only exception is the overload where you specify a single text-definition, that automatically applies to all found targets. Such as `haveText('some text')`.
>
> For the overloads using arrays to specify text-requirements, the number of specified text-definitions must match the number of found targets in the test-run.
>
> This is a safety feature of ngtx in order to prevent a test being green, only because the assertion stopped iterating
> and thus not checking all the targets that were originally found.
