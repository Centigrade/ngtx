## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveStyle`

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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ haveStyle ・ [haveText]

---

This assertion checks if its associated target(s) have the specified style properties on their `nativeElement`s.

## Signature

```ts
haveStyles(styleProps: Partial<CSSStyleDeclaration> | Partial<CSSStyleDeclaration>[]);
```

## Examples

```ts
class the {
  static ExpanderArrow() {
    return get(IconComponent);
  }
}

it('[Expander] should have have Arrow showing down when closed', () => {
  When(host)
    .has(state({ open: false }))
    .expect(the.ExpanderArrow)
    .to(haveStyle({ transform: 'rotate(0deg)' }));
});

it('[Expander] should have have Arrow showing up when opened', () => {
  When(host)
    .has(state({ open: true }))
    .expect(the.ExpanderArrow)
    .to(haveStyle({ transform: 'rotate(180deg)' }));
});
```
