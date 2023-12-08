## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveCalled`

[home]: ../README.md
[docs]: ../overview.md
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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ haveCalled ・ [haveCssClass] ・ [haveEmitted] ・ [haveState] ・ [haveStyle] ・ [haveText]

---

The `haveCalled` assertion checks that a target did call the specified method.

## Signature

```ts
haveCalled(callSiteResolver: CallSiteResolver<HtmlType, ComponentType, ResolvedCallSite>, methodName: keyof ResolvedCallSite, opts: CallOptions);
```

| Parameter        | Type                                                           | Description                                                                                                    |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| callSiteResolver | `(target: TargetRef<Html, ComponentType>) => ResolvedCallSite` | A function that maps a `TargetRef` to an object on which a method is expected to be called.                    |
| methodName       | `keyof ResolvedCallSite`                                       | The name of the method on the resolved call site. This method is the one that is expected to have been called. |
| callOptions      | `CallOptions`                                                  | Optional object containing additional asserting options to be checked.                                         |

### `CallOptions`

| Property     | Type             | Description                                                                                                                                      |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| args         | `any[]`          | An array of values that map to the arguments with which the method is expected to be called.                                                     |
| times        | `number \| null` | The number of times you expect the function to be called. Defaults to `1`. If you intentionally want to ignore the number of calls, pass `null`. |
| whichReturns | `any`            | The value that the spy should return, when called.                                                                                               |

## Examples

```ts
import {
  clicked,
  haveCalled,
  componentMethod,
  injected,
  nativeMethod,
} from '@centigrade/ngtx';

class the {
  static CreateUserButton() {
    return get('button[type=submit]');
  }
  static NameInput() {
    return get('input.user-name');
  }
}

it('[FormView] should call the event handler onSubmit', () => {
  When(the.CreateUserButton)
    .gets(clicked())
    .expect(host)
    .to(
      // imported from '@centigrade/ngtx'
      haveCalled(componentMethod, 'onSubmit', {
        args: [userProps],
      }),
    );
});

it('[FormView] should call the user-service onSubmit', () => {
  When(the.CreateUserButton)
    .gets(clicked())
    .expect(host)
    .to(
      // imported from '@centigrade/ngtx'
      haveCalled(injected(UserService), 'createUser', {
        args: [userProps],
        whichReturns: Promise.resolve(true),
      }),
    );
});

it('[FormView] should focus the first input after view init', () => {
  When(host).calls('ngAfterViewInit').expect(the.NameInput).to(
    // imported from '@centigrade/ngtx'
    haveCalled(nativeMethod, 'focus'),
  );
});
```
