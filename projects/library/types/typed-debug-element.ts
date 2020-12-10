import { DebugElement } from '@angular/core';

export interface TypedDebugElement<Component, HTMLElement = HTMLUnknownElement>
  extends DebugElement {
  nativeElement: HTMLElement;
  componentInstance: Component;
}
