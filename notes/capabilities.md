```ts
class DisabledCapabilities extends Capabilities(DisabledDirective, {
  directive: true,
}) {
  disable(value: boolean = true) {
    return When(this.self)
      .has(state({ disabled: true }))
      .and(detectChanges());
  }
}

class ButtonCapabilities extends Capabilities(ButtonComponent, {
  extends: [DisabledCapabilities],
}) {
  click() {
    return When(this.self).gets(clicked({ nativeClick: true }));
  }
  haveBeenClicked(opts?: EmissionOpts) {
    // = When(this.self).rendered().expect(this.self)
    return this.expect.to(haveEmitted('click', opts));
  }
}

class DialogCapabilities extends Capabilities(DialogService, {
  service: true,
}) {}
```
