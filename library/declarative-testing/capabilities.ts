import { NgtxElement, NgtxMultiElement } from '../core';
import { beFound, FindingOptions, haveEmitted, haveState, state } from './lib';
import {
  DeclarativeTestingApi,
  EmissionOptions,
  ExpectApi,
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
  protected assert: AssertionBuilder<Component>;
  protected actions: ActionBuilder<Component>;

  protected get whenComponents() {
    return this._when(this._components);
  }

  protected get expectComponents() {
    return this.negate
      ? this.whenComponents.rendered().expect(this._components).not
      : this.whenComponents.rendered().expect(this._components);
  }

  constructor(
    protected readonly _when: DeclarativeTestingApi,
    protected readonly _components: TargetRef<HTMLElement, Component>,
    protected readonly negate = false,
  ) {
    this.assert = new AssertionBuilder(_when, _components, this.negate);
    this.actions = new ActionBuilder(_when, _components);
  }

  public get not() {
    return this.createCapabilities(this._components, !this.negate);
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

  private createCapabilities(
    ref: TargetRef<HTMLElement, Component>,
    negate: boolean = this.negate,
  ): this {
    // TODO: we should really find a better way to construct the specialized capabilities class at runtime:
    const thisSubClassConstructor: any = this.constructor;
    return new thisSubClassConstructor(this._when, ref, negate);
  }
}

// --------------------------------------
// module internals
// --------------------------------------

//#region types
type Callable<T> = T & Function;
type TestBaseStatement<Component> = (
  value?: any,
) => ExpectApi<HTMLElement, Component>;
//#endregion

//#region entities
class ActionBuilder<Component> {
  protected statement: TestBaseStatement<Component> = () =>
    this.whenComponents.rendered();

  protected get whenComponents() {
    return this.when(this.target);
  }

  protected get currentStatement(): TestBaseStatement<Component> {
    return this.statement.bind(this);
  }

  constructor(
    private readonly when: DeclarativeTestingApi,
    private readonly target: TargetRef<HTMLElement, Component>,
  ) {}

  public setProperty<PropertyKey extends keyof Component = keyof Component>({
    name,
    defaultSetterValue,
  }: PropertyValueDescriptor<Partial<Component>, PropertyKey>) {
    const current = this.currentStatement;

    this.statement = (value: Component[PropertyKey] = defaultSetterValue!) =>
      current().and(
        this.whenComponents.has(state({ [name as PropertyKey]: value })),
      );

    return this;
  }

  public emitEvent<PropertyKey extends keyof Component>({
    name,
    defaultSetterValue,
  }: PropertyValueDescriptor<Component, PropertyKey>) {
    const current = this.currentStatement;

    this.statement = (value: Component[PropertyKey] = defaultSetterValue!) =>
      current().and(
        this.whenComponents.emits(
          name as PropertyKey,
          value ?? defaultSetterValue,
        ),
      );

    return this;
  }

  public and(...extensions: ExtensionFn<HTMLElement, Component>[]) {
    const current = this.currentStatement;
    this.statement = (value?: any) => current(value).and(...extensions);
    return this;
  }

  public done() {
    return this.statement;
  }
}

class AssertionBuilder<Component> {
  private get expectTargets() {
    return this.negated
      ? this.when(this.target).rendered().expect(this.target).not
      : this.when(this.target).rendered().expect(this.target);
  }

  constructor(
    private readonly when: DeclarativeTestingApi,
    private readonly target: TargetRef<HTMLElement, Component>,
    private readonly negated: boolean,
  ) {}

  property<K extends keyof Component = keyof Component>({
    name,
    defaultAssertionValue,
    isArrayProperty,
  }: PropertyValueDescriptor<Partial<Component>, K>) {
    return (value?: Component[K] | Component[K][]) => {
      const statesToCheck = getStatesToAssert(
        value,
        defaultAssertionValue,
        name as string,
        isArrayProperty ?? false,
      );

      return this.expectTargets.will(haveState(statesToCheck));
    };
  }

  eventEmission<K extends keyof Component = keyof Component>({
    name,
  }: PropertyDescriptor<Component, K>) {
    return (opts: EmissionOptions = {}) =>
      this.expectTargets.will(haveEmitted(name as K, opts));
  }
}

//#endregion
