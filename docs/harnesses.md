[home]: ../README.md
[overview]: ./overview.md
[addngtx]: ./add-ngtx.md
[builtins]: ./built-in.md
[extensionfns]: ./extending.md
[dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

# [🏠][home] &nbsp; → &nbsp; [Documentation][overview] &nbsp; → &nbsp; **Component Harnesses**

## Taking Things to a Higher Level

If you use declarative testing for a while, you will notice that, even that we're pretty close to being [DRY] with our testing code, there are still common patterns that occur over and over again. When taking a second, closer look we realize that these recurring "patterns" are just basic capabilities of your components.

For example it is no surprise that a line like:

```ts
When(some.Button).gets(clicked())...
```

is often used across all the test cases in your project - because well - a button was literally made to be clicked. So clicking a button is a core capability of a `app-button` component. There are a lot of similar situations for other components as well. So the thing is, that we're keep repeating these capability-statements (click a button) all over the place in the project.

In order to further reduce the repetitive code, we can write a component harness class for e.g. the button:

```ts
import { WhenStatement } from '@centigrade/ngtx';

export class ButtonComponentHarness {
  constructor(
    protected when: WhenStatement,
    protected button: TargetRef<HTMLElement, ButtonComponent>,
  ) {}

  public getsClicked() {
    return this.when(this.button).gets(clicked());
  }

  public toHaveLabel(label: string) {
    return this.when(the.button)
      .rendered()
      .expect(the.button)
      .will(haveText(label));
  }
}
```

> ### ⚠️ Use `.will()` instead of `.to()` in Component Harnesses
>
> Instead of `expect(...).to(...)` we use `expect(...).will(...)`, because `to` would immediately run the test, which is not what we want. `will` only adds the assertion without running the test afterwards, as component harnesses are meant to be "plugged into" tests, not being a complete test of their own.

> ### 💡 Assertions always needs to start with `When` as well
>
> The harness class' assertion looks a bit funny, but since all declarative statements need to start with a `When` clause, we just feed it a noop-start-sentence (`When(button).rendered()` basically does nothing).

With that simple harness class for our buttons in place, we can optimize our tests further:

```ts
class the {
  static LoginButton = new ButtonComponentHarness(When, () =>
    get('button.login'),
  );
}

// ...

it('should open the login dialog when the login button was clicked', () => {
  When(the.LoginButton.getsClicked())
    .expect(host)
    .to(haveCalled('showLoginDialog'));
});

it('should show the username in the logout button', () => {
  When(host)
    .has(state({ loggedIn: true, username: 'Ann' }))
    .expect(the.LoginButton.toHaveLabel('Logout, Ann'));
});
```
