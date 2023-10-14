## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `beFound`

[home]: ../README.md
[docs]: ../../DOCUMENTATION.md
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

Other Assertions: &nbsp; beFound ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) are present in the template of the component-under-test. Its assertion can be further specified via a configuration parameter.

## Signature

```ts
beFound(opts?: FindingOptions);
```

### Interface `FindingOptions`

```ts
interface FindingOptions {
  times?: number;
}
```

## Example

```ts
class the {
  static CongratulationsText() {
    return get('p.congrats');
  }
  static CartItems() {
    return getAll(CartItemComponent);
  }
}

it('should show a congratulations text, if the user has birthday', () => {
  When(host)
    .has(state({ userHasBirthday: true }))
    .expect(the.CongratulationsText)
    .to(beFound());
});

it('should show as many cart items as the user has ordered products', () => {
  When(host)
    .has(state({ items: ['Product 1', 'Product 2', 'Product 3'] }))
    .expect(the.CartItems)
    .to(beFound({ times: 3 }));
});
```
