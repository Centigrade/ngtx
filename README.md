![ngtx logo](./docs/media/logo.svg)

> If you have ideas how to further improve ngtx feel free to raise an issue and/or contribute.

# @centigrade/ngtx

![](https://github.com/Centigrade/ngtx/workflows/CI/badge.svg)

ngtx stands for "A**ng**ular **T**esting E**x**tensions" and is a small set of functions aiming to make your life easier when testing Angular components. It's supposed to make your tests lean while increasing the readability by boosting the semantics of each test case.

## Why?

All common things we do in Angular tests are quite verbose. We often find ourselves writing stuff that does not express our intensions, but really are just steps on our way to our test-goal. Furthermore, while we care about production code to be clean and easy to understand, our testing code is left WET instead of DRY and hard to understand on the first glance.

We can do better and we think we should. ngtx is meant to help you with that by "injecting" small "helpers" into your tests improving both, productivity and readability.

## Getting Started

New to ngtx? Let's get you started with these links:

- [Getting Started / First Steps][firststeps]
- [Feature Overview][features]
- [Api Documentation][documentation]
- [Declarative Testing API][declarativetesting] (**🔥 new!**)

Having questions or issues using ngtx? You may want to take a look at this:

- [Examples][examples]
- [StackOverflow][stackoverflow]

### Quick Start

`$ npm install @centigrade/ngtx --save-dev`

```ts
import { ngtx } from '@centigrade/ngtx';

describe(
  'MyComponent',
  ngtx(({ useFixture, get /*, other ngtx helpers... */ }) => {
    // skipping Angular test boilerplate code...
    beforeEach(() => {
      const fixture = TestBed.createComponent(MyComponent);
      useFixture(fixture);
    });

    it('should have a title', () => {
      expect(get('.title')).toBeDefined();
    });
  }),
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
[firststeps]: ./docs/FIRST_STEPS.md
[stackoverflow]: https://stackoverflow.com/questions/tagged/ngtx
