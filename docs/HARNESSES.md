## [🏠][home] &nbsp; → &nbsp; [Documentation][api] &nbsp; → &nbsp; **Component Test Harnesses**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### First Steps
>
> You may want to visit our [first steps page][firststeps].
>
> ### Writing Good Tests
>
> Introduction on [how to write simple, maintainable tests using ngtx][goodtests] and its features.
>
> ### Declarative Testing API
>
> Formal documentation of ngtx' [declarative testing api][declarativetests] helping you to write beautiful, simple and robust tests.

---

</details>

&nbsp;

This article explains what component test harnesses are and why they are useful for everyday testing.

> ### Pro Tip!
>
> To make the most of it, combine them with ngtx' [declarative testing api][goodtests]!

## Use Component Test-APIs (aka "Component Harnesses")

Although being "DRY" is something absolutely normal in production code, this is often not true in testing code. But fact is, the same reasons behind us writing DRY code in production, should urge us to maintaining DRY in testing code as well.

ngtx is featuring a concept that is also known as `Component Harnesses`. Harnesses are an abstraction of the component-under-test against the test suite that actually performs the tests. This way tests use a well-defined API rather than search the component's template for semantic stuff that might change in future.

When the component evolves, the tests can stay the same and only the component harness needs to be adapted to the component's change. Moreover, this approach makes your code automatically DRY, since each test-case uses a common API rather than reformulating its search-queries for semantic parts of your component under test.

### Example

Say we have an table component listing some persons and providing basic actions:

```ts
@Component({
  template: `
    <table>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Actions</th>
      </tr>
      <tr *ngFor="let person of persons" data-ngtx="item-row">
        <td>{{ person.name }}</td>
        <td>{{ person.age }}</td>
        <td>
          <button>Edit</button>
          <button>Delete</button>
        </td>
      </tr>
    </table>
  `,
})
class MyTableComponent {
  @Input() persons: Person[] = [];
}
```

When testing this component, the simplest approach is to let the test cases search for their own:

```ts
// BAD: Don't do it that way
it('should show correct details of a person', () => {
  // arrange
  table.items = [{ name: 'Ann', age: 27 }];

  // act
  detectChanges();

  // assert
  const row = get('ngtx_item-row');
  const name = row.get('td:nth-child(1)').textContent();
  const age = row.get('td:nth-child(2)').textContent();
  expect(name).toEqual('Ann');
  expect(age).toEqual('27');
});
```

This would surely work, but we have a problem here. Whenever the component-template changes – let's say, we reorder the columns for some reason – we need to go through **all the tests** and change `td:nth-child(1)` into `td:nth-child(2)` and vice versa.

Also the css query selectors are everything but semantic. If you read the test case, it's quite hard to parse what the test is really doing here. It's basically a bunch of `magic numbers and strings` put together to get this test running.

All this might not be a big deal for a small number of test-cases, but for medium- to large-sized application this quickly becomes a huge mess being impossible to maintain. But of course we can do better:

```ts
// BETTER: Do it that way:
@NgtxApi()
class Get {
  static Row() {
    return get('ngtx_item-row').withApi(RowApi);
  }
}

@NgtxApi()
class RowApi extends NgtxElement {
  NameColumn() {
    return this.get('td:nth-child(1)');
  }
  AgeColumn() {
    return this.get('td:nth-child(2)');
  }
}

it('should show correct details of a person', () => {
  // arrange
  table.items = [{ name: 'Ann', age: 27 }];

  // act
  detectChanges();

  // assert
  const row = Get.Row();
  const name = row.NameColumn().textContent();
  const age = row.AgeColumn().textContent();
  expect(name).toEqual('Ann');
  expect(age).toEqual('27');
});
```

### What's happening in the code above?

- We're creating a harness class `Get` and provide static query methods in it.
- In our case we only have a single API `static Row()` yet, but you can easily extend it when other tests need access to further parts of the template.
- Additionally we create a `RowApi` class, that provides further custom query functions that can be called on the result of the `Row()` call. We attach the `RowApi` to the `static Row()` result by using the `withApi` feature of ngtx.

This way we only need to adjust very few lines of code whenever we reorder columns. Also other structural or semantical changes to the component can be handled better since we have a clear overview about the needed APIs for our tests.

It may seem to be overhead to some, but it is really worth it. Of course you need to spend some time in writing the test API, but it saves you far more time when it comes to component changes. Thus our strong recommendation is to follow this pattern, even for smaller components being tested.

[api]: ./DOCUMENTATION.md
[goodtests]: ./GOOD_TESTS.md
[declarativetests]: ./DECLARATIVE_TEST_API.md
[firststeps]: ./FIRST_STEPS.md
[home]: ../README.md
