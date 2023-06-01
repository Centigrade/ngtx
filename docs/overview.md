[home]: ../README.md
[builtin]: ./built-in.md
[getstarted]: ./ngtx.md
[componentharnesses]: ./harnesses.md
[addngtx]: ./add-ngtx.md
[examples]: ./examples.md
[extending]: ./extending.md
[extensionfns]: ./extending.md

# [🏠][home] &nbsp; → &nbsp; Documentation

## Welcome to ngtx!

**No matter if you love or hate unit-testing of Angular components, ngtx was made for you.**

With simple concepts in mind, we strive for easy-to-read, error-robust and DRY test-suites that are actually fun to write. If this sounds good to you, keep on reading!

### ngtx?

```ts
class the {
  static FinishButton() {
    return get<HTMLButtonElement>('.btn[type=submit]');
  }
}

it('[Dialog] should emit the finish-event when clicking on finish button', () => {
  const dialogResult: DialogResult = 'ok';

  When(the.FinishButton)
    .gets(clicked())
    .expect(host)
    .to(haveEmitted('finish', { arg: dialogResult }));
});
```

Write tests in a way that is actually understandable, quick and fun.

### Recommended Learning Path

To get you started we recommend you to read the following articles in this order:

1. [Get started: Understanding the Concepts][getstarted]
2. [Hands-On: Add ngtx to your tests][addngtx]
3. [Get an overview: See common examples][examples]
4. [How to write custom extensions][extending]

### Further Resources

- [All built-in, declarative features][builtin]
- [Component Harnesses][componentharnesses]
