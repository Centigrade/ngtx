import { SimpleChange, SimpleChanges } from '@angular/core';
import { keysOf } from './object.utilities';

export function toSimpleChanges(
  object: Record<string, unknown>,
): SimpleChanges {
  return keysOf(object).reduce(
    (changes, property) => ({
      ...changes,
      [property]: new SimpleChange(undefined, object[property], true),
    }),
    {} as SimpleChanges,
  );
}

export function inputsOf<T>(component: T): Partial<T> {
  const componentCtor = (component as any).constructor;
  return componentCtor.ɵcmp.inputs;
}

export function inputNamesOf<T>(component: T): (keyof T & string)[] {
  const inputs = inputsOf(component);
  return keysOf(inputs) as (keyof T & string)[];
}
