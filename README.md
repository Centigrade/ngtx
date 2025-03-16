[api]: ./docs/built-in.md
[declarativetesting]: ./docs/overview.md
[documentation]: ./docs/ngtx.md
[examples]: ./docs/examples.md
[stackoverflow]: https://stackoverflow.com/questions/tagged/ngtx
[changelog]: ./docs/changelog.md
[dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

![ngtx logo](./docs/media/logo.svg)

> If you have ideas how to further improve ngtx feel free to raise an issue and/or contribute.

# @centigrade/ngtx

![](https://github.com/Centigrade/ngtx/workflows/CI/badge.svg)

`$ npm install @centigrade/ngtx --save-dev`

ngtx stands for "A**ng**ular **T**esting E**x**tensions" and is a small set of functions aiming to make your life easier when testing Angular components. It's supposed to make your tests lean while increasing the readability by boosting the semantics of each test case.

This is what a declarative test with `ngtx` can look like (skipping some minimal boilerplate):

```ts
class the {
  static ClearTextButton() {
    // get is a simplified version of debugElement.query(By.css/directive):
    return get(IconButtonComponent);
  }
}

it('[TextboxComponent] should clear the text of the input when the clear button is clicked', () => {
  // host always refers to the component-under-test, so here it is the TextboxComponent:
  When(host)
    .has(state({ text: 'some text' }))
    .and(the.ClearTextButton)
    .gets(clicked())
    .expect(host)
    .to(haveState({ text: '' }));
});
```

Easy to read, easy to grasp. This is how we like our unit tests. But there is a lot more waiting for you to be explored. Ready when you are!

## Why?

All common things we do in Angular tests are quite verbose. We often find ourselves writing stuff that does not express our intensions, but really are just steps on our way to our test-goal. Furthermore, while we care about production code to be clean and easy to understand, our testing code is left WET instead of [DRY] and hard to understand on the first glance.

We can do better and we think we should. ngtx is meant to give you the necessary tools to write super-expressive test cases that focus on the semantics rather than on imperative testing-code. Get onboard and start writing your tests declarative, to make the most of your time and code.

## Compatibility Table

| ngtx    | Angular |
| ------- | ------- |
| 2.5.0   | >= 17   |
| < 2.5.0 | >= 13   |

> For version details see the [changelog].

## Getting Started

New to ngtx? Let's get you started with these links:

- [Getting Started / First Steps][declarativetesting]

Having questions or issues using ngtx? You may want to take a look at this:

- [Examples][examples]
- [StackOverflow][stackoverflow]

## Contributing

If you know and like ngtx we would love for you to contribute by either giving us feedback on issues or missing features or even by helping us implement already [existing issues](https://github.com/Centigrade/ngtx/issues). If you have ideas how to improve our workflow you're also welcome to share it with us.

## Team

- Julian Lang ([GitHub: JulianLang](https://github.com/JulianLang), author)
- Patrick-Andre Decker
