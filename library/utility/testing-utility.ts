import { TypedDebugElement } from '../types';
import { asArray } from './array.utilities';

export function adaptExpectedValuesToFoundTargets<
  Html extends HTMLElement,
  Component,
>(input: {
  targets: TypedDebugElement<Html, Component>[];
  valueOrValues: any | any[];
}) {
  const { targets, valueOrValues } = input;
  const values = asArray(valueOrValues);

  // one value for all targets
  if (values.length === 1) {
    return new Array(targets.length).fill(values.at(0));
  }
  // number of values matches number of found targets
  if (values.length === targets.length) {
    return values;
  }

  throw new Error(
    `The number targets found (${targets.length}) does not match the number of expected values (${valueOrValues.length}).`,
  );
}
