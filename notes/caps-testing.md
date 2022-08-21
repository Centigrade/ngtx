```ts
describe(
  'InfoViewComponent',
  ngtx<InfoViewComponent>(({ useFixture, When, host, get, getAll }) => {
    beforeEach(() => {});

    const create = new Capabilities(When, get, getAll);

    class the {
      static host = create.CartView(host);
      static SearchBar = create.AutoComplete('ngtx_search');
      static SearchItems = create.AutoCompleteItems('ngtx_search-items');
      static SearchButton = create.Button('ngtx_search-button');
      static Items = create.ShopItems('ngtx_shop-item');
    }

    it(`should show all items`, () => {
      When(the.host.hasItems([1, 2, 3]))
        .expect(the.Items)
        .to(beFound({ times: 3 }));
    });

    it(`select the item being clicked`, () => {
      When(the.host.hasItems([1, 2, 3, 4]).withSelected(undefined))
        .and(the.Items(nth(3)).getsClicked())
        .expect(the.host.toHaveSelectedItem(3));
    });

    it(`remove an item being removed`, () => {
      When(the.host.hasItems([1, 2, 3, 4]))
        .and(the.Items(nth(3)).clicksRemove())
        .expect(the.host.toHaveItems([1, 2, 4]));
    });

    it(`reset the selected item if it gets removed`, () => {
      When(the.host.hasItems([1, 2, 3, 4]).withSelected(3))
        .and(the.Items(nth(3)).clicksRemove())
        .expect(the.host.toHaveSelectedItem(undefined));
    });

    it(`present the correct search results`, fakeAsync(() => {
      When(the.host.hasProducts$(['Galaxy S2', 'iPhone 11', 'MacBook Pro']))
        .and(the.SearchBar.changesText('iphone'))
        .expect(the.SearchItems.toShowUp(['iPhone 11']));
    }));
  }),
);

class CartViewCapabilities {
  hasItems(items: number[]) {
    const base = when(self)
      .has(state({ cartItems: items }))
      .and(detectChanges({ viaChangeDetectorRef: true }));

    return Object.assign(base, {
      withSelected(whichOne: ItemSelectorFn /* e.g. nth(3) */) {
        return when(self)
          .has(state({ selectedItem: nth }))
          .and(base);
      },
    });
  }
}
```
