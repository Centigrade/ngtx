import { NgtxEmptySet } from '../core/constants';

export function isTargetNotFound(value: unknown): boolean {
  return value == null || value === NgtxEmptySet;
}
