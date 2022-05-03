import { NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';
import {
  AnyValues,
  DeclarativeTestExtension,
  EmissionOptions,
  EventsOf,
  PartRef,
  TargetResolverFn,
} from './types';

export interface ISetSpyFactory {
  setSpyFactory(spyFactory: SpyFactoryFn): void;
}

export type WhenFn<HostHtml extends HTMLElement, Host> = ISetSpyFactory &
  (<Html extends HTMLElement, Component>(
    subjectRef: PartRef<Html, Component>,
  ) => DeclarativeTestingApi<HostHtml, Host, Html, Component>);

export type TestingApiFactoryFn = <HostHtml extends HTMLElement, Host>(
  fx: NgtxFixture<HostHtml, Host>,
) => WhenFn<HostHtml, Host>;

export interface ExpectApi<HostHtml extends HTMLElement, Host> {
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
  ): Expectations<HostHtml, Host, ObjectHtml, ObjectType>;
}

export interface Expectations<
  HostHtml extends HTMLElement,
  Host,
  ObjectHtml extends HTMLElement,
  ObjectType,
> {
  /**
   * Allows to pass a custom assertion function that gets called by ngtx at the end of the test case.
   * @param assertion `DeclarativeTestExtension`-function that adds an assertion to the `DeclarativeTestState`.
   */
  to(
    assertion: DeclarativeTestExtension<
      HostHtml,
      Host,
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
  toHaveState(map: Partial<AnyValues<ObjectType>>): void;
  toHaveAttributes(map: Partial<AnyValues<ObjectHtml>>): void;
  toEmit(
    eventName: keyof ObjectType,
    opts?: Omit<EmissionOptions, 'whichReturns'>,
  ): void;
}

export interface ExtensionsApi<HostHtml extends HTMLElement, Host> {
  and(
    ...extensions: DeclarativeTestExtension<
      HostHtml,
      Host,
      HTMLElement,
      unknown,
      HTMLElement,
      unknown
    >[]
  ): ExpectApi<HostHtml, Host>;
}

export interface AfterPredicateApi<HostHtml extends HTMLElement, Host>
  extends ExtensionsApi<HostHtml, Host>,
    ExpectApi<HostHtml, Host> {}

export interface DeclarativeTestingApi<
  HostHtml extends HTMLElement,
  Host,
  SubjectHtml extends HTMLElement,
  Subject,
> {
  rendered(): AfterPredicateApi<HostHtml, Host>;
  calls(
    method: keyof Subject | keyof SubjectHtml,
    ...args: any[]
  ): AfterPredicateApi<HostHtml, Host>;
  emits(
    eventName: keyof Subject | EventsOf<keyof SubjectHtml>,
    args?: any,
  ): AfterPredicateApi<HostHtml, Host>;
  hasAttributes(
    map: Partial<AnyValues<SubjectHtml>>,
  ): AfterPredicateApi<HostHtml, Host>;
  hasState(map: Partial<AnyValues<Subject>>): AfterPredicateApi<HostHtml, Host>;
  // --------------------------------------
  // predicate extension function aliases
  // --------------------------------------
  does: PredicateExtensionFn<HostHtml, Host, SubjectHtml, Subject>;
  has: PredicateExtensionFn<HostHtml, Host, SubjectHtml, Subject>;
  gets: PredicateExtensionFn<HostHtml, Host, SubjectHtml, Subject>;
  is: PredicateExtensionFn<HostHtml, Host, SubjectHtml, Subject>;
}

export type PredicateExtensionFn<
  HostHtml extends HTMLElement,
  Host,
  SubjectHtml extends HTMLElement,
  Subject,
> = (
  action: DeclarativeTestExtension<
    HostHtml,
    Host,
    SubjectHtml,
    Subject,
    HTMLElement,
    unknown
  >,
) => AfterPredicateApi<HostHtml, Host>;
