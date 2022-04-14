```ts
import { ngtx, then } from '@centigrade/ngtx';

describe(
  'SearchFieldComponent',
  ngtx<SearchFieldComponent>(({ useFixture, When, host, get }) => {
    // ----------------
    //  Setup
    // ----------------
    beforeEach(async () => {
      // TestModule configuration as usual ...
    });

    beforeEach(() => {
      const fixture = TestBed.createComponent(SearchFieldComponent);
      useFixture(fixture, {
        spyFactory: (returnValue) => jest.fn(() => returnValue),
      });
    });

    // ----------------
    //  Test Harness
    // ----------------
    class Components {
      static Input() {
        return get<HTMLInputElement, unknown>('input');
      }
      static Button() {
        return get(ButtonComponent);
      }
      static Text() {
        return get<HTMLParagraphElement, unknown>('p');
      }
    }

    // ----------------
    //  Test Cases
    // ----------------
    it('should clear the text of the input when the clear button is clicked', () => {
      When(host)
        .hasState({ text: 'some text' })
        .and(then(Components.Button).emits('click'))
        .expect(host)
        .toHaveState({ text: '' });
    });
  }),
);
```
