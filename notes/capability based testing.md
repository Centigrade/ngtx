# capability based testing

- dialog: call open, check if open was called; closed
- button: can emit click, check if click was emitted
- label: can have a text, check if it has a text
  ...

rather describe the scenario more semantically than technically describing for which properties/methods/events to check

- "when the info button is clicked, the dialog should open"
- "when the dialog was opened, the dialog content should be visible"

```ts
class the {
  constructor(private get, private getAll) {}

  Label() {
    return this.get('.label');
  }
}

class ButtonCapabilities {
  isEnabled() {
    return (buttons: ElementList<HTMLElement, ButtonComponent>, _, fixture) => {
      buttons.componentInstance.disabled = false;
      fixture.detectChanges();
    };
  }
  isDisabled() {
    return (buttons: ElementList<HTMLElement, ButtonComponent>) => {
      buttons.componentInstance.disabled = true;
      fixture.detectChanges();
    };
  }
  getsClicked(opts: ClickOpts) {
    return (buttons: ElementList<HTMLElement, ButtonComponent>) => {
      buttons.forEach((b) => {
        if (opts.nativeClick) {
          b.nativeElement.click();
        } else {
          b.triggerEvent('click');
        }
      });

      fixture.detectChanges();
    };
  }
  hasText(text) {
    return (buttons: ElementList<HTMLElement, ButtonComponent>) => {
      buttons.forEach((b) => {
        expect(b.textContent()).toBe(text);
      });
    };
  }
  toBeClicked() {
    return (
      buttons: ElementList<HTMLElement, ButtonComponent>,
      { addPredicate, addAssertion },
    ) => {
      addAssertion(() => {
        // ...
      });
    };
  }
  toHaveText(text) {
    return (buttons: ElementList<HTMLElement, ButtonComponent>) => {
      to(haveText(text));
    };
  }
}
```

```ts
describe('Dialog', () => {
  class the {
    static Button() {
      return get(ButtonComponent, ButtonCapabilities);
    }
  }

  it('should open the dialog on button click', () => {
    When(the.Button)
      .isEnabled()
      .and.getsClicked()
      .expect(the.Dialog)
      .toBeOpen();
  });

  it('should have OK as button text initially', () => {
    When(host).rendered().expect(the.Button).toHaveText('OK');
  });
});
```
