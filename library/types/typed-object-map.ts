export type TypeObjectMap<K> = {
  [P in keyof Partial<K>]: any;
};
