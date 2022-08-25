import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, FindingOptions, haveEmitted, haveState, state } from './lib';
import {
  DeclarativeTestingApi,
  EmissionOptions,
  PropertyDescriptor,
  PropertyValueDescriptor,
  TargetRef,
} from './types';
import { asNgtxElementListRef } from './utility';

export class Capabilities<Component> {
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
    private _components: TargetRef<HTMLElement, Component>,
  ) {}

  public get not() {
    this.negate = !this.negate;
    return this;
  }

  protected templates = {
    prop: {
      setter: <PropertyKey extends keyof Component = keyof Component>({
        name,
        defaultValue,
      }: PropertyValueDescriptor<Component, PropertyKey>) => {
        return (value: Component[PropertyKey] = defaultValue!) =>
          this.whenComponents.has(state({ [name]: value }));
      },
      assertion: <PropertyKey extends keyof Component = keyof Component>({
        name,
        defaultValue,
      }: PropertyValueDescriptor<Component, PropertyKey>) => {
        return (value?: Component[PropertyKey] | Component[PropertyKey][]) => {
          const valuesToCheck = Array.isArray(value)
            ? value.map((x) => ({ [name]: x }))
            : { [name]: value ?? defaultValue };
          return this.expectComponents.will(haveState(valuesToCheck));
        };
      },
    },
    event: {
      emitter: <PropertyKey extends keyof Component>({
        name,
        defaultValue,
      }: PropertyValueDescriptor<Component, PropertyKey>) => {
        return (arg?: any) => {
          return this.whenComponents.emits(name, arg ?? defaultValue);
        };
      },
      assertion: <PropertyKey extends keyof Component = keyof Component>({
        name,
      }: PropertyDescriptor<Component, PropertyKey>) => {
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

  public where(filter: (e: NgtxElement<HTMLElement, Component>) => boolean) {
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

  private createCapabilities(ref: TargetRef<HTMLElement, Component>): this {
    // TODO: we should really find a better way to construct the specialized capabilities class at runtime:
    const thisSubClassConstructor: any = this.constructor;
    return new thisSubClassConstructor(this._when, ref);
  }
}
