## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Declarative Testing][declarative] &nbsp;→ &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `waitFakeAsync`

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

Other Predicates: &nbsp; [attributes] ・ [callLifeCycleHook] ・[call] ・ [clicked] ・ [debug] ・ [detectChanges]・ [emit] ・ [provider] ・[state] ・waitFakeAsync

---

This predicate waits the specified amount of time within a `fakeAsync`-zone.

> ### Please Note
>
> This predicate only works in a `fakeAsync`-zone. If not called in a `fakeAsync`-zone it will throw causing the test case to fail.

## Signature

```ts
waitFakeAsync(modeOrMs?: 'animationFrame' | number);
```

## Example

```ts
import { state, waitFakeAsync, haveText, haveEmitted } from '@centigrade/ngtx';
import { fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';

class the {
  static GreetingLabel() {
    return get('h2');
  }
}

it('should render the correct welcome message', fakeAsync(() => {
  When(host)
    .has(state({ userName$: of('Ann') }))
    .and(waitFakeAsync())
    .expect(the.GreetingLabel)
    .to(haveText('Welcome Ann!'));
}));

it('[Popup] should emit a close event after five seconds', fakeAsync(() => {
  When(host)
    .rendered()
    .and(waitFakeAsync(5000))
    .expect(host)
    .to(haveEmitted('close'));
}));
```
