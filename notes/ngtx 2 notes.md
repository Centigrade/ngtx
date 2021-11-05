```ts
class Get {
  static Table() {
    return get('table');
  }
  static HeaderRow() {
    return get('th').withApi(RowApi);
  }
  static DataRows() {
    return getAll('td').withApi(RowApi);
  }
}

class RowApi extends NgtxElement {
  Column(id: string) {
    return this.getAll(`ngtx:${name}-column`);
  }
}

it(() => {
  // arrange
  Get.HeaderRow().Column('name');
  Get.DataRows().Column('name');
  Get.DataRows().atIndex(0)
  Get.DataRows().nth(0)
  Get.DataRows().map((row) => row.);
});
```
