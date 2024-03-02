## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveCssClass`

[home]: ../README.md
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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ haveCssClass ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

The `haveCssClass` assertion checks that a target has the specified CSS class(es).

## Signature

```ts
haveCssClass(cssClasses);
```

| Overload | Parameter  | Type         | Description                                                                                                                                                              |
| -------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | cssClasses | `string`     | The name of the css class needed to be present. If the assertion's `TargetRef` refers to multiple targets, all of them needs to have the class to pass the test.         |
| 2        | cssClasses | `CssClass[]` | An array of css classes, where the array-item position refers to the index of the target.                                                                                |
| 2        | cssClasses | `string[][]` | A two-dimensional array of css classes, where the first dimension refers to the index of the target and the second to the classes that should be checked on that target. |

### `type CssClass`

```ts
type CssClass = string | undefined;
```

## Examples

```ts
import { haveCssClass } from '@centigrade/ngtx';

class the {
  // don't bother if you don't know "allOrNth" yet.
  // it's just an small api to simplify handling of targetRefs referring to multiple targets.
  static ContextMenuItems = allOrNth(ContextMenuItemComponent, getAll);
  static ContextMenu() {
    return get(ContextMenuComponent);
  }
}

it('[ContextMenuItems] should not have the hover class initially', () => {
  When(host).rendered().expect(the.ContextMenuItems).not.to(
    // since we have a target-ref referring to multiple targets
    // the assertion applies to all of them. No item must have this class:
    haveCssClass('hover'),
  );
});

it('[ContextMenuItems] should have the hover class when mouse enters', () => {
  When(the.ContextMenuItems.first)
    .emits('mouseenter')
    .expect(the.ContextMenuItems)
    .to(
      // as we pass an array, we have fine-grained control over
      // the classes we want to check. This assertions checks, that
      // the 1st item has classes "item" and "hover", while the
      // 2nd and 3rd items are only checked on the "item" class:
      haveCssClass([['item', 'hover'], 'item', 'item']),
    );
});
```

> ## ⚠️ The number of class-definitions _must_ match the number of targets found when the test runs
>
> The only exception is the overload where you specify a single class, that automatically applies to all found targets. Such as `haveCssClass("selected")`.
>
> For the overloads using arrays to specify class-requirements, the number of specified classes must match the number of found targets in the test-run.
>
> This is a safety feature of ngtx in order to prevent a test being green, only because the assertion stopped iterating
> and thus not checking all the targets that were originally found.

> ## 💡 Skipping assertions for some targets
>
> If you want to skip checking some of the targets, just pass `undefined` as their class requirements:
>
> ```ts
> haveCssClass([['item', 'hover'], undefined, 'item']),
> ```
>
> In the example above, the second item will not be checked for classes.
