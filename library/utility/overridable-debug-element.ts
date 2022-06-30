import { DebugElement } from '@angular/core';
import { TypedDebugElement } from '../types';

export class OverridableDebugElement<Html extends HTMLElement, Component>
  extends DebugElement
  implements TypedDebugElement<Html, Component>
{
  private overriddenComponentInstance?: Component;

  get componentInstance(): Component {
    return (
      this.overriddenComponentInstance ??
      OverridableDebugElement.prototype.componentInstance
    );
  }

  constructor(nativeNode: Element, componentInstanceRef: Component) {
    super(nativeNode);
    this.overriddenComponentInstance = componentInstanceRef;
  }
}
