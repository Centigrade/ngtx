![ngtx logo](./docs/media/logo.svg)

> If you have ideas how to further improve ngtx feel free to raise an issue and/or contribute.

# @centigrade/ngtx

![](https://github.com/Centigrade/ngtx/workflows/CI/badge.svg)

ngtx stands for "A**ng**ular **T**esting E**x**tensions" and is a small set of functions aiming to make your life easier when testing Angular components. It's supposed to make your tests lean while increasing the readability by boosting the semantics of each test case.

## Why?

All common things we do in Angular tests are quite verbose. We often find ourselves writing stuff that does not express our intensions, but really are just steps on our way to our test-goal. Furthermore, while we care about production code to be clean and easy to understand, our testing code is left WET instead of DRY and hard to understand on the first glance.

We can do better and we think we should. ngtx is meant to give you the necessary tools to write super-expressive test cases that focus on the semantics rather than on imperative testing-code. Get onboard and start writing your tests declarative, to make the most of your time and code.

## Getting Started

New to ngtx? Let's get you started with these links:

- [Getting Started / First Steps][firststeps]
- [Feature Overview][features]
- [Declarative Testing API][declarativetesting] (**🔥 new (currently alpha)**)

Having questions or issues using ngtx? You may want to take a look at this:

- [Examples][examples]
- [How to: Writing Good Tests][goodtests]
- [StackOverflow][stackoverflow]

### Quick Start

`$ npm install @centigrade/ngtx --save-dev`

```ts
import { ngtx } from '@centigrade/ngtx';

describe(
  'MyComponent',
  ngtx<MyComponent>(
    ({ useFixture, When, host, get, getAll /*, other ngtx helpers... */ }) => {
      // skipping Angular test boilerplate code...
      beforeEach(() => {
        const fixture = TestBed.createComponent(MyComponent);
        useFixture(fixture);
      });

      class the {
        static Headline() {
          return get('h1');
        }
        static Features() {
          return getAll(ListItemComponent);
        }
      }

      it('should have a title', () => {
        When(host)
          .has(state({ title: 'Welcome to ngtx!' }))
          .expect(the.Headline)
          .to(haveText('Welcome to ngtx!'));
      });

      it('should list all its features', () => {
        const ExpectTheFeatureListItems = When(host)
          .rendered()
          .expect(the.Features);

        ExpectTheFeatureListItems.to(beFound({ times: 4 }));
        ExpectTheFeatureListItems.to(
          haveText([
            'many handy test helpers, such as simple template querying via get and getAll',
            'powerful declarative testing-api for super-expressive test cases',
            'encouraging support for testing component harnesses',
            'unobtrusive, just acts as a layer above the test-fixture',
          ]),
        );
      });
    },
  ),
);
```

## Contributing

If you know and like ngtx we would love for you to contribute by either giving us feedback on issues or missing features or even by helping us implement already [existing issues](https://github.com/Centigrade/ngtx/issues). If you have ideas how to improve our workflow you're also welcome to share it with us.

- [Contributing][contributing]
- [Code of Conduct][codeofconduct]

## Team

- Julian Lang ([GitHub: JulianLang](https://github.com/JulianLang), author)
- Patrick-Andre Decker

[api]: ./docs/API.md
[contributing]: ./CONTRIBUTING.md
[codeofconduct]: ./CODE_OF_CONDUCT.md
[declarativetesting]: ./docs/DECLARATIVE_TEST_API.md
[documentation]: ./docs/DOCUMENTATION.md
[examples]: ./docs/EXAMPLES.md
[features]: ./docs/FEATURES.md
[goodtests]: ./docs/GOOD_TESTS.md
[firststeps]: ./docs/FIRST_STEPS.md
[stackoverflow]: https://stackoverflow.com/questions/tagged/ngtx
