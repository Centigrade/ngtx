import { QueryTarget } from '../types';

export function isNgtxQuerySelector(selector: QueryTarget<any, any>): boolean {
  if (typeof selector !== 'string') {
    return false;
  }

  return selector.startsWith('ngtx_');
}
