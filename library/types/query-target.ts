import { Type } from '@angular/core';
import { TypedDebugElement } from './typed-debug-element';

export type QueryTarget<Component, Html extends HTMLElement> =
  | string
  | TypedDebugElement<Component, Html>
  | Type<Component>;
