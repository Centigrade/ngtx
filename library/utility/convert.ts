import { asSelf } from '../core/converter';
import { Fn } from '../types';

export function convert<T = any[], R = any>(
  value: T,
  convertTo?: Fn<[T], R>,
): R {
  const converterFn = convertTo ?? asSelf;

  return converterFn(value as any) as R;
}
