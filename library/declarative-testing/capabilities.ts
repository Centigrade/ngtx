import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, FindingOptions, haveEmitted, haveState, state } from './lib';
import {
  DeclarativeTestingApi,
  EmissionOptions,
  ExtensionFn,
  PropertyDescriptor,
  PropertyValueDescriptor,
  TargetRef,
} from './types';
import { asNgtxElementListRef } from './utility';

const getStatesToAssert = (
  expectedStateOrStates: any,
  defaultValue: any,
  propName: string,
  isArrayProperty: boolean,
): any => {
  if (isArrayProperty) {
    // hint: value could also be "expect.any(Array)", which is no array
    const isArray = Array.isArray(expectedStateOrStates);
    const isNestedArray = isArray && Array.isArray(expectedStateOrStates[0]);

    // we pass multiple prop states
    if (isNestedArray) {
      return expectedStateOrStates.map((propState: any[]) => {
        return { [propName]: propState };
      });
    }

    // we only pass one prop state, so check this one for all found matches in template
    return { [propName]: expectedStateOrStates ?? defaultValue };
  }

  return Array.isArray(expectedStateOrStates)
    ? expectedStateOrStates.map((x) => ({ [propName]: x }))
    : { [propName]: expectedStateOrStates ?? defaultValue };
};

export class Capabilities<Component> {
  private negate = false;
  protected assert: AssertionBuilder<Component>;

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
  ) {
    this.assert = new AssertionBuilder(_when, _components);
  }

  public get not() {
    this.negate = !this.negate;
    return this;
  }

  protected templates = {
    prop: {
      setter: <PropertyKey extends keyof Component = keyof Component>({
        name,
        defaultSetterValue,
      }: PropertyValueDescriptor<Partial<Component>, PropertyKey>) => {
        return (value: Component[PropertyKey] = defaultSetterValue!) =>
          this.whenComponents.has(state({ [name as PropertyKey]: value }));
      },
      assertion: <PropertyKey extends keyof Component = keyof Component>({
        name,
        defaultAssertionValue,
        isArrayProperty,
      }: PropertyValueDescriptor<Component, PropertyKey>) => {
        return (value?: Component[PropertyKey] | Component[PropertyKey][]) => {
          const propName = name as PropertyKey;

          const statesToCheck = getStatesToAssert(
            value,
            defaultAssertionValue,
            propName as string,
            isArrayProperty ?? false,
          );

          return this.expectComponents.will(haveState(statesToCheck));
        };
      },
    },
    event: {
      emitter: <PropertyKey extends keyof Component>({
        name,
        defaultSetterValue,
      }: PropertyValueDescriptor<Component, PropertyKey>) => {
        return (arg?: any) => {
          return this.whenComponents.emits(
            name as PropertyKey,
            arg ?? defaultSetterValue,
          );
        };
      },
      assertion: <PropertyKey extends keyof Component = keyof Component>({
        name,
      }: PropertyDescriptor<Component, PropertyKey>) => {
        return (opts: EmissionOptions = {}) => {
          return this.expectComponents.will(
            haveEmitted(name as PropertyKey, opts),
          );
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

class AssertionBuilder<Component> {
  private assertion?: Callable<AssertionStatement<Component>>;

  constructor(
    private when: DeclarativeTestingApi,
    private target: TargetRef<HTMLElement, Component>,
  ) {}

  property<K extends keyof Component = keyof Component>({
    name,
    defaultAssertionValue,
    isArrayProperty,
  }: PropertyValueDescriptor<Partial<Component>, K>) {
    const assertion = new AssertionStatement(this.when, this.target);
    this.assertion = assertion.create(
      (value?: Component[K] | Component[K][]) => {
        const statesToCheck = getStatesToAssert(
          value,
          defaultAssertionValue,
          name as string,
          isArrayProperty ?? false,
        );

        return [haveState(statesToCheck)];
      },
    );

    return this;
  }

  create() {
    const current = this.assertion;
    this.assertion = undefined;
    return current!;
  }
}

class AssertionStatement<Component = any> {
  //#region negation
  private negate = false;
  public readonly not = new Proxy(
    {},
    {
      get: () => {
        this.negate = !this.negate;
        return this;
      },
    },
  );
  //#endregion

  private get expectTargets() {
    console.warn(this.negate);

    return this.negate
      ? this.when(this.targets).rendered().expect(this.targets).not
      : this.when(this.targets).rendered().expect(this.targets);
  }

  constructor(
    private when: DeclarativeTestingApi,
    private targets: TargetRef<HTMLElement, Component>,
  ) {}

  public create<Input>(
    assertions: (v?: Input) => ExtensionFn<HTMLElement, Component>[],
  ): Callable<this> {
    return Object.assign((value?: any) => {
      return this.expectTargets.will(...assertions(value));
    }, this);
  }
}

export type Callable<T> = T & Function;
