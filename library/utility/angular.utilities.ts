import { isStandalone, SimpleChange, SimpleChanges, Type } from '@angular/core';
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

export function isStandaloneDeclaration(value: any): value is Type<any> {
  if (!value || Array.isArray(value)) return false;
  return isStandalone(value);
}
export function isComponent(value: any): value is Type<any> {
  if (!value || Array.isArray(value)) return false;
  return value?.ɵcmp != undefined;
}
export function isDirective(value: any): value is Type<any> {
  return value?.ɵdir != undefined && value?.ɵcmp == undefined;
}
export function isPipe(value: any): value is Type<any> {
  return value?.ɵpipe != undefined;
}
export function isNgModule(value: any): value is Type<any> {
  return (
    // hint: usual modules
    value?.ɵmod != undefined ||
    // hint: forRoot() | forChild() patterns
    ('ngModule' in value && value?.ngModule.ɵmod != undefined)
  );
}
