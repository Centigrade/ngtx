import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, FindingOptions } from './lib';
import { DeclarativeTestingApi, TargetRef } from './types';
import { asNgtxElementListRef } from './utility';

export class Capabilities<T> {
  private negate = false;

  protected get whenComponents() {
    return this._when(this._components);
  }

  protected get expectComponents() {
    return this.negate
      ? this.whenComponents.rendered().expect(this._components).not
      : this.whenComponents.rendered().expect(this._components);
  }

  constructor(
    protected _when: DeclarativeTestingApi,
    private _components: TargetRef<HTMLElement, T>,
  ) {}

  public get not() {
    this.negate = !this.negate;
    return this;
  }

  public first() {
    return this.atIndex(0);
  }

  public last() {
    return this.createCapabilities(() => {
      const refs = this.getTargetRefs();
      return refs[refs.length - 1];
    });
  }

  public nth(position: number) {
    return this.createCapabilities(() => this.getTargetRefs()[position - 1]);
  }

  public atIndex(index: number) {
    return this.createCapabilities(() => this.getTargetRefs()[index]);
  }

  public where(filter: (e: NgtxElement<HTMLElement, T>) => boolean) {
    return this.createCapabilities(() => {
      const refs = this.getTargetRefs();
      return new NgtxMultiElement(refs.filter(filter));
    });
  }

  public toBeFound(opts: FindingOptions = {}) {
    return this.expectComponents.will(beFound(opts));
  }

  private getTargetRefs() {
    return asNgtxElementListRef(this._components)();
  }

  private createCapabilities(ref: TargetRef<HTMLElement, T>): this {
    // TODO: we should really find a better way to construct the specialized capabilities class at runtime:
    const thisSubClassConstructor: any = this.constructor;
    return new thisSubClassConstructor(this._when, ref);
  }
}
