import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, beMissing, FindingOptions } from './lib';
import { ExpectApi, TargetRef, WhenStatement } from './types';
import { asNgtxElementListRef } from './utility';

export class ComponentHarness<Component> {
  protected get: NgtxElement['get'] = (target) => {
    return (this._target() as any).get(target);
  };

  protected getAll: NgtxElement['getAll'] = (target) => {
    return (this._target() as any).getAll(target);
  };

  protected get whenComponent() {
    return this.when(this._target);
  }

  protected get expectComponent() {
    return this.negate
      ? this.whenComponent.rendered().expect(this._target).not
      : this.whenComponent.rendered().expect(this._target);
  }

  protected get expect() {
    return this.whenComponent.rendered().expect;
  }

  constructor(
    protected readonly when: WhenStatement,
    protected readonly _target: TargetRef<HTMLElement, Component>,
    protected readonly negate = false,
  ) {}

  public get not() {
    return this.createCapabilities(this._target, !this.negate);
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

  public where(filter: (e: NgtxElement<HTMLElement, Component>) => boolean) {
    return this.createCapabilities(() => {
      const refs = this.getTargetRefs();
      return new NgtxMultiElement(refs.filter(filter));
    });
  }

  public toBeFound(opts: FindingOptions = {}) {
    return this.expectComponent.will(beFound(opts));
  }

  public toBeMissing() {
    return this.expectComponent.will(beMissing());
  }

  public to: ComponentHarness<Component>['expectComponent']['will'] = (
    ...assertions
  ) => this.expectComponent.will(...assertions);

  private getTargetRefs() {
    return asNgtxElementListRef(this._target)();
  }

  private createCapabilities(
    ref: TargetRef<HTMLElement, Component>,
    negate: boolean = this.negate,
  ): this {
    // TODO: we should really find a better way to construct the specialized capabilities class at runtime:
    const thisSubClassConstructor: any = this.constructor;
    return new thisSubClassConstructor(this.when, ref, negate);
  }
}

// --------------------------------------
// module internals
// --------------------------------------

//#region types
type TestBaseStatement<Component> = (
  value?: any,
) => ExpectApi<HTMLElement, Component>;
//#endregion
