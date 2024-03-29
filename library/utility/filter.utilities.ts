import { NgtxElement } from '../core';

export function removeDuplicates<T extends NgtxElement>(array: T[]): T[] {
  return array.filter(
    (item, index) =>
      array.findIndex((i) => i.debugElement === item.debugElement) === index,
  );
}
