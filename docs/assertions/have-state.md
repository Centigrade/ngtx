## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveState`

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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ haveState ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) have the specified properties on their `componentInstance`.

> #### 💡 Checking the `nativeElement` rather than the `componentInstance`
>
> If you want to check for HTML attributes on the target's `nativeElement`, please refer to [haveAttributes].

## Signature

```ts
haveState<T>(stateDef:
    | PropertiesOf<T>
    | PropertiesOf<T>[]
    | (index: number) => PropertiesOf<T>
);
```

| Overload | Parameter | Type                                 | Description                                                                                                                                                                                   |
| -------- | --------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | stateDef  | `PropertiesOf<T>`                    | An object defining what state / properties are expected on the target's `componentInstance`.                                                                                                  |
| 2        | stateDef  | `PropertiesOf<T>[]`                  | An array of objects defining what state / properties are expected on the targets' `componentInstance`s. The index of an object translates to the index of a target in the found targets list. |
| 3        | stateDef  | `(index: number) => PropertiesOf<T>` | A function mapping the index of a target being found to its expected state.                                                                                                                   |

### `type PropertiesOf<T>`

```ts
type PropertiesOf<T> = Partial<T & Record<keyof T, any>>;
```

## Examples

```ts
import { haveState } from '@centigrade/ngtx';

class the {
  // don't bother if you don't know "allOrNth" yet.
  // it's just an small api to simplify handling of targetRefs referring to multiple targets.
  static ContextMenuItems = allOrNth(ContextMenuItemComponent, getAll);
  static ContextMenu() {
    return get(ContextMenuComponent);
  }
}

it('[ContextMenuItems] should not be selected initially', () => {
  When(host)
    .rendered()
    .expect(the.ContextMenuItems)
    .to(
      // since we have a target-ref referring to multiple targets
      // the assertion applies to all of them; so all items must
      // have a "selected" property with the value false:
      haveState({ selected: false }),
    );
});

it('[ContextMenuItems] should be selected once the mouse enters', () => {
  When(the.ContextMenuItems.first)
    .emits('mouseenter')
    .expect(the.ContextMenuItems)
    .to(
      // as we pass an array, we have fine-grained control over
      // the classes we want to check. This assertions checks, that
      // the 1st item has a property "selected" with the value true,
      // while the 2nd and 3rd items are checked to have the "selected" property with value false:
      haveState([{ selected: true }, { selected: false }, { selected: false }]),
      // alternatively you can use the map function overload:
      haveState((index) => ({ selected: index === 0 })),
    );
});
```

> ## ⚠️ The number of state-definitions _must_ match the number of targets found when the test runs
>
> The only exception is the overload where you specify a single state-definition, that automatically applies to all found targets. Such as `haveState({ selected: true })`.
>
> For the overloads using arrays to specify state-requirements, the number of specified state-definitions must match the number of found targets in the test-run.
>
> This is a safety feature of ngtx in order to prevent a test being green, only because the assertion stopped iterating
> and thus not checking all the targets that were originally found.
