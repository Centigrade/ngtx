## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; [Built-In Functionality][index] &nbsp; → &nbsp; `haveEmitted`

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

Other Assertions: &nbsp; [beFound] ・ [beMissing] ・ [containText] ・ [haveAttributes] ・ [haveCalled] ・ [haveCssClass] ・ haveEmitted ・ [haveState] ・ [haveStyle] ・ [haveText]

---

The `haveEmitted` assertion checks that a target did emit the specified event.

## ⚠️ Before you use this assertion

Since ngtx does support jasmine and jest, it does not know how to create spies, which is needed for this assertion to work. That's why you need to configure ngtx before being able to use the `haveEmitted` assertion.

[See how to configure it here.][configure]

## Signature

```ts
haveEmitted<Html extends HTMLElement, Component>(
  eventName: Events<Html, Component>,
  opts?: EmissionOptions,
): void;
```

| Parameter | Type                                            | Description                                                            |
| --------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| eventName | `Events<Html, Component>`<br>(type-safe string) | The name of the event that is expected to have emitted.                |
| opts      | `EmissionOptions`                               | Optional object containing additional asserting options to be checked. |

### `EmissionOptions`

| Property | Type             | Description                                                                                                                                      |
| -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| arg      | `any`            | The event argument that is expected to be emitted.                                                                                               |
| times    | `number \| null` | The number of times you expect the function to be called. Defaults to `1`. If you intentionally want to ignore the number of calls, pass `null`. |

## Examples

```ts
import { clicked, haveEmitted } from '@centigrade/ngtx';

class the {
  static Checkbox() {
    return get<HTMLInputElement>('input[type=checkbox]');
  }
}

it('[Checkbox] should emit the checkedChange event when the user clicks the native input', () => {
  When(the.Checkbox)
    .gets(clicked({ nativeClick: true }))
    .expect(host)
    .to(
      haveEmitted('checkedChange', {
        times: 1, // actually the default, listing for educational purposes
        arg: true,
      }),
    );
});
```
