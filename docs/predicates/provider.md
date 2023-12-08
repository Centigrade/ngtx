## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `provider`

[home]: ../README.md
[index]: ../built-in.md
[docs]: ../overview.md
[attributes]: ./attributes.md
[calllifecyclehook]: ./call-life-cycle-hook.md
[call]: ./call.md
[clicked]: ./clicked.md
[debug]: ./debug.md
[detectchanges]: ./detect-changes.md
[emit]: ./emit.md
[provider]: ./provider.md
[state]: ./state.md
[waitfakeasync]: ./wait-fake-async.md

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・[call] ・[clicked] ・[debug] ・[detectChanges] ・ [emit] ・ provider ・ [state] ・ [waitFakeAsync]

---

This predicate resolves the specified injection token on the associated targets and allows for manipulation of them. For example you can change the state of the resolved injection tokens or emit data on subjects. See examples for some use cases.

## Signature

```ts
provider(token: T) : {
  withState(stateDef: Partial<T>);
  emittingOnProperty$(propertyName: keyof T, value?: any);
  emitting$(value?: any);
}
```

## Examples

```ts
import { provider } from '@centigrade/ngtx';

class the {
  static WelcomeMessage() {
    return get('span.welcome');
  }
}

it('should greet the logged in user (variant 1)', () => {
  When(host)
    .has(provider(AuthService).withState({ user$: of({ name: 'Ann Smith' }) }))
    .expect(the.WelcomeMessage)
    .to(containText('Ann Smith'));
});

it('should greet the logged in user (variant 2)', () => {
  When(host)
    .has(
      provider(AuthService).emittingOnProperty$('user$', { name: 'Ann Smith' }),
    )
    .expect(the.WelcomeMessage)
    .to(containText('Ann Smith'));
});

// in the following example test, we have a token IsLoggedIn$
// that is a BehaviorSubject containing the initial value false:
abstract class IsLoggedIn$ extends BehaviorSubject<boolean> {}

beforeEach(() => {
  TestBed.configureTestingModule({
    // ...
    providers: [
      { provide: IsLoggedIn$, useFactory: () => new BehaviorSubject(false) },
    ],
  });
});

it('should show a greeting when the logged in state changes', () => {
  When(host)
    .has(provider(IsLoggedIn$).emitting$(true))
    .expect(the.WelcomeMessage)
    .to(beFound());
});
```
