export class List<T> extends Array<T> {
  constructor(private readonly source: T[]) {
    super(...source);
  }

  first(): T | undefined {
    return this.source[0];
  }
  last(): T | undefined {
    return this.source[this.source.length - 1];
  }
  nth(pos: number): T | undefined {
    return this.source[pos - 1];
  }
}
