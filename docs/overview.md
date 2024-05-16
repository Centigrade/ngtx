[home]: ../README.md
[builtin]: ./built-in.md
[getstarted]: ./ngtx.md
[componentharnesses]: ./harnesses.md
[addngtx]: ./add-ngtx.md
[examples]: ./examples.md
[extending]: ./extending.md
[querying]: ./querying.md
[dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

# [🏠][home] &nbsp; → &nbsp; Documentation

## Welcome to ngtx!

**No matter if you love or hate unit-testing of Angular components, ngtx was made for you.**

With simple concepts in mind, we strive for easy-to-read, error-robust and [DRY] test suites that are actually fun to write. If this sounds good to you, keep on reading!

### What's ngtx?

ngtx are a**ng**ular **t**esting e**x**tensions; its core feature is, that it allows you to write your tests declaratively. Declarative tests with ngtx looks like that:

```ts
// class that lists all elements in html-template
// we need for our tests:
class the {
  static FinishButton() {
    // get is a simplified version of query(By.css/directive)
    return get<HTMLButtonElement>('.btn[type=submit]');
  }
}

it('[Dialog] should emit the finish-event when clicking on finish button', () => {
  const dialogResult: DialogResult = 'ok';

  When(the.OkButton)
    .gets(clicked())
    .expect(host) // host = the component under test => DialogComponent
    .to(haveEmitted('finish', { arg: dialogResult })); // asserts that "finish"-event was emitted
});
```

Write tests in a way that is actually understandable, quick and fun.

> As always, when learning a new way of doing things, you initially have to understand some concepts, like the `the`-class and of course the general structure of declarative tests. You'll also want to know the basic, built-in [predicates and assertions][builtin], but they are easy to remember after a short while.
>
> However, once you wrote a few declarative tests, the overall concept gets more and more clear and finally becomes the natural way of describing tests for you. To get there, it's pretty helpful to follow the below-mentioned learning path, and to take a look at some [examples][examples] in order to gain a better understanding how to write those tests.

### Recommended Learning Path

To get you started we recommend you to read the following articles in this order:

1. [Get started: Understanding the Concepts][getstarted]
2. [Hands-On: Add ngtx to your tests][addngtx]
3. [Get an overview: See common examples][examples]
4. [Understand how to query targets][querying]
5. [How to write custom extensions][extending]

### Further Resources

- [All built-in, declarative features][builtin]
- [Component Harnesses][componentharnesses]
