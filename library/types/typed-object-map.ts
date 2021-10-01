export type TypeObjectMap<K> = Partial<
  {
    [P in keyof Partial<K>]: any;
  }
>;
