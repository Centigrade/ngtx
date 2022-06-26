export class List<T> extends Array<T> {
  constructor(private readonly source: T[]) {
    super(...source);
  }

  first(orDefault?: T): T | undefined {
    return this.source[0] ?? orDefault;
  }
  last(orDefault?: T): T | undefined {
    return this.source[this.source.length - 1] ?? orDefault;
  }
  nth(pos: number): T | undefined {
    return this.source[pos - 1];
  }
}
