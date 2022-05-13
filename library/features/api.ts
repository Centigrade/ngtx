import { NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';
import {
  DeclarativeTestExtension,
  EmissionOptions,
  EventsOf,
  PartRef,
  PropertyMap,
  TargetResolverFn,
} from './types';

export interface ISetSpyFactory {
  setSpyFactory(spyFactory: SpyFactoryFn): void;
}

export type WhenFn<HostHtml extends HTMLElement, Host> = ISetSpyFactory &
  (<Html extends HTMLElement, Component>(
    subjectRef: PartRef<Html, Component>,
  ) => DeclarativeTestingApi<Html, Component>);

export type TestingApiFactoryFn = <HostHtml extends HTMLElement, Host>(
  fx: NgtxFixture<HostHtml, Host>,
) => WhenFn<HostHtml, Host>;

export interface ExpectApi {
  /**
   * Defines the **object** part of the test-case.
   *
   * ---
   *
   * A declarative test case consists of:
   *
   *  - `<subject> <predicate> <object> <assertion>`
   *
   * similar to a sentence in human language. The **subject** does something (= **predicate**)
   * affecting the **object** which will be checked in the **assertion**.
   * @param objectRef The `PartRef` that is going to be checked for the test's assertion.
   * @returns A number of assertions that can be made upon the **object**.
   */
  expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
    objectRef: PartRef<ObjectHtml, ObjectType>,
  ): Expectations<ObjectHtml, ObjectType>;
}

export interface Expectations<ObjectHtml extends HTMLElement, ObjectType> {
  not: Expectations<ObjectHtml, ObjectType>;
  /**
   * Allows to pass a custom assertion function that gets called by ngtx at the end of the test case.
   * @param assertion `DeclarativeTestExtension`-function that adds an assertion to the `DeclarativeTestState`.
   */
  to(
    assertion: DeclarativeTestExtension<
      HTMLElement,
      unknown,
      ObjectHtml,
      ObjectType
    >,
  ): void;
  /**
   * Injects the specified injection token and asserts that the test's **object** calls a method on it.
   * @param targetResolver A `TargetResolverFn` such as `injected`, `componentMethod` or `elementMethod`.
   * @param methodName The method name that is expected to be called.
   * @param opts `EmissionOptions` specifying what to assert.
   */
  toHaveCalled<T>(
    targetResolver: TargetResolverFn<
      HTMLElement,
      unknown,
      ObjectHtml,
      ObjectType,
      T
    >,
    method: keyof T,
    opts?: EmissionOptions,
  ): void;
  toHaveCssClass(...classNames: string[]): void;
  toBePresent(): void;
  toBeMissing(): void;
  toContainText(text: string): void;
  toHaveText(text: string): void;
  toHaveState(map: Partial<PropertyMap<ObjectType>>): void;
  toHaveAttributes(map: Partial<PropertyMap<ObjectHtml>>): void;
  toEmit(
    eventName: keyof ObjectType,
    opts?: Omit<EmissionOptions, 'whichReturns'>,
  ): void;
}

export interface ExtensionsApi<SubjectHtml extends HTMLElement, Subject> {
  and(
    ...extensions: DeclarativeTestExtension<
      SubjectHtml,
      Subject,
      HTMLElement,
      unknown
    >[]
  ): ExpectApi;
}

export interface AfterPredicateApi<SubjectHtml extends HTMLElement, Subject>
  extends ExtensionsApi<SubjectHtml, Subject>,
    ExpectApi {}

export interface DeclarativeTestingApi<
  SubjectHtml extends HTMLElement,
  Subject,
> {
  rendered(): AfterPredicateApi<SubjectHtml, Subject>;
  calls(
    method: keyof Subject | keyof SubjectHtml,
    ...args: any[]
  ): AfterPredicateApi<SubjectHtml, Subject>;
  emits(
    eventName: keyof Subject | EventsOf<keyof SubjectHtml>,
    args?: any,
  ): AfterPredicateApi<SubjectHtml, Subject>;
  hasAttributes(
    map: Partial<PropertyMap<SubjectHtml>>,
  ): AfterPredicateApi<SubjectHtml, Subject>;
  hasState(
    map: Partial<PropertyMap<Subject>>,
  ): AfterPredicateApi<SubjectHtml, Subject>;
  // --------------------------------------
  // predicate extension function aliases
  // --------------------------------------
  does: PredicateExtensionFn<SubjectHtml, Subject>;
  has: PredicateExtensionFn<SubjectHtml, Subject>;
  gets: PredicateExtensionFn<SubjectHtml, Subject>;
  is: PredicateExtensionFn<SubjectHtml, Subject>;
}

export type PredicateExtensionFn<SubjectHtml extends HTMLElement, Subject> = (
  action: DeclarativeTestExtension<SubjectHtml, Subject, HTMLElement, unknown>,
) => AfterPredicateApi<SubjectHtml, Subject>;
