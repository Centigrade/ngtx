## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `beMissing`

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

Other Assertions: &nbsp; [beFound] ・ beMissing ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

This assertion checks if its associated target(s) are not to be found in the template of the component-under-test.

## Signature

```ts
beMissing();
```

## Example

```ts
class the {
  static AdminPanel() {
    return get(AdminPanelComponent);
  }
}

it('should hide the admin-panel if the current user is no admin', () => {
  When(host)
    .has(state({ user: { role: 'user' } }))
    .expect(the.AdminPanel)
    .to(beMissing());
});
```
