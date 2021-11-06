import { Type } from '@angular/core';
import { NgtxElement } from '../../entities';

export class Expect {
  static element(ngtxElement: NgtxElement) {
    return class {
      static toBeHtmlElement(type: typeof HTMLElement): void {
        expect(ngtxElement).toBeDefined();
        expect(ngtxElement).toBeInstanceOf(NgtxElement);
        expect(ngtxElement.nativeElement).toBeInstanceOf(type);
      }
      static toBeComponent(type: Type<any>): void {
        expect(ngtxElement).toBeDefined();
        expect(ngtxElement).toBeInstanceOf(NgtxElement);
        expect(ngtxElement.component).toBeInstanceOf(type);
      }
    };
  }
}
