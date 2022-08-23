import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, FindingOptions, haveEmitted, haveState, state } from './lib';
import { DeclarativeTestingApi, EmissionOptions, TargetRef } from './types';
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
    private _when: DeclarativeTestingApi,
    private _components: TargetRef<HTMLElement, T>,
  ) {}

  public get not() {
    this.negate = !this.negate;
    return this;
  }

  protected templates = {
    prop: {
      setter: <P extends keyof T = keyof T>(name: P, defaultValue?: T[P]) => {
        return (value: T[P] = defaultValue!) =>
          this.whenComponents.has(state({ [name]: value }));
      },
      assertion: <P extends keyof T = keyof T>(name: P) => {
        return (value: T[P] | T[P][]) => {
          const valuesToCheck = Array.isArray(value)
            ? value.map((x) => ({ [name]: x }))
            : { [name]: value };
          return this.expectComponents.will(haveState(valuesToCheck));
        };
      },
    },
    event: {
      emitter: <P extends keyof T>(name: P) => {
        return (arg?: any) => {
          return this.whenComponents.emits(name, arg);
        };
      },
      assertion: <P extends keyof T = keyof T>(name: P) => {
        return (opts: EmissionOptions = {}) => {
          return this.expectComponents.will(haveEmitted(name, opts));
        };
      },
    },
  };

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
