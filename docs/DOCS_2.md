# ngtx v2

ngtx is currently being redesigned to even better fit complex testing use cases. This is why ngtx version 2 is currently employing an experimental API, that is not considered stable yet.

If you like to use ngtx in production right now, you might want to resort to ngtx version 1 (`npm i -D @centigrade/ngtx@1`).

# Including ngtx into your tests

In order to include ngtx, you use the `useFixture` bootstrap function **as you already did in version 1**:

```ts
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ngtx } from '@centigrade/ngtx';

describe(
  'Some test suite',
  ngtx(({ useFixture }) => {
    let fixture: ComponentFixture<YourComponent>;
    let component: YourComponent;

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          // your testing module setup
        }).compileComponents();
      }),
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(YourComponent);
      component = fixture.componentInstance;
      useFixture(fixture);
    });

    it('should have ngtx ready to use', () => {});
  }),
);
```

Also, the way you include helpers into your tests are the same as in version 1. Fore more details refer to the chapter in [version 1][docs1].

Actual differences to version 1 will be explained in the next chapter.

# Breaking Changes

## Renamed Helpers

Some helpers has been renamed:

- `find` got renamed to `get`
- `findAll` got renamed to `getAll`

### ngtx version 1

```ts
describe(
  'YourComponent',
  ngtx(({ useFixture, find, findAll }) => {
    // beforeEach setup hooks skipped ...

    it('should have a headline', () => {
      const headline = find('h1');
      expect(headline).toBeTruthy();
    });

    it('should have paragraphs', () => {
      const paragraphs = findAll('p');
      expect(paragraphs.length).toBe(3);
    });
  }),
);
```

### ngtx version 2

```ts
describe(
  'YourComponent',
  ngtx(({ useFixture, get, getAll }) => {
    // beforeEach setup hooks skipped ...

    it('should have a headline', () => {
      const headline = get('h1');
      expect(headline).toBeTruthy();
    });

    it('should have paragraphs', () => {
      const paragraphs = getAll('p');
      expect(paragraphs.length).toBe(3);
    });
  }),
);
```

## getAll vs. findAll

While `findAll` (ngtx v1) will return an empty array when nothing could be found, `getAll` (ngtx v2) will return `null` in those cases. The reason behind it is actually a convenience feature, because it makes specific checks that are needed with ngtx v1, redundant in ngtx v2:

```ts
// ngtx v1:
component.items = ['apple', 'bananas'];
const items = findAll('.data-row');

// check needed, since the forEach would not run if nothing was found
// resulting in the test actually pass!
expect(items.length).toBeGreaterThan(0);
// this is where the actual test criteria is defined:
items.forEach((item, index) => {
  const itemText = textContent(item);
  expect(itemText).toEqual(component.items[index]);
});
```

The additional check for the array length is not needed anymore, since `getAll` will now actually return `null`, when nothing was found, leading to an exception when trying to call `forEach` on it:

```ts
// ngtx v2
component.items = ['apple', 'bananas'];
const items = getAll('.data-row');
// this will fail if nothing was found, since items would be null:
items.forEach((item) => {
  expect(item.textContent()).toEqual(component.items[index]);
});
```

# Introduced Features in v2

ngtx also comes with some new features.

## Chainable Queries

In ngtx 2 you can now chain your queries, which effectively allows you to reuse queries you have defined once.

```ts
it('[table] should have a table-row with a delete button', () => {
  const dataRow = get('.data-row');

  expect(dataRow).toBeTruthy();
  expect(dataRow.get('.delete-btn')).toBeTruthy();
});
```

This might not seem incredibly useful at first glance, but comes in very handy when using [ngtx' testing APIs][ngtx_api] or handling complexly-nested testing scenarios.
Moreover, it is a crucial step forward to further improve DRY-ness of testing suites.

## Attaching Custom APIs to Query Results

You can define and use your own APIs as attachments to existing query results. This might sound complex now, but is actually quite simple:

```ts
@NgtxApi()
class Get {
  static TableRow() {
    // here we execute a query and attach the custom api "RowApi"
    // that is defined below this class.
    return get('.table-row').withApi(RowApi);
  }
  static TableRows() {
    // here we execute a query and attach the custom api "MultiRowApi"
    return getAll('.table-row').withApi(MultiRowApi);
  }
}

@NgtxApi()
class RowApi extends NgtxElement {
  NameColumn() {
    // all queries will be executed on the result they get attached to.
    return this.get('td:nth-child(1)');
  }
  AgeColumn() {
    return this.get('td:nth-child(2)');
  }
}

@NgtxApi()
class MultiRowApi extends NgtxMultiElement {
  NameColumns() {
    // all queries will be executed on the result they get attached to.
    return this.get('td:nth-child(1)');
  }
  AgeColumns() {
    return this.get('td:nth-child(2)');
  }
}

// now using these attached APIs
it('[table] should show correct person details', () => {
  // calling RowApi here:
  const nameField = Get.TableRow().NameColumn();
  // calling MultiRowApi here:
  const nameFieldOfAllRows = Get.TableRows().NameColumns();
});
```

> **Please Note:** Attaching custom APIs
>
> You need to provide a different API to `get` results as you would do for `getAll` results.
> This comes from a technical limitation, since `getAll` returns a `NgtxMultiElement`
> while `get` returns a `NgtxElement`.
>
> We're trying to improve this, but currently you need to provide seperate APIs for each result-type.

[ngtx_api]: ./GOOD_TESTS.md#use-component-test-apis
[docs1]: ./DOCUMENTATION.md
