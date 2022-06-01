import { Type } from '@angular/core';
import { NgtxFixture } from '../entities';
import { Token } from './types';

export function allOrNth<Html extends HTMLElement, T = any>(
  type: Token<T> | string,
  getAll: NgtxFixture<Html, T>['getAll'],
) {
  return (nth?: number) => {
    return () =>
      nth != null ? getAll(type as Type<T>).nth(nth) : getAll(type as Type<T>);
  };
}
