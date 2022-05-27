import { NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';
import {
  DeclarativeTestExtension,
  EmissionOptions,
  EventsOf,
  MultiPartRef,
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
  ): SingleExpectations<ObjectHtml, ObjectType>;
  expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
    objectRef: MultiPartRef<ObjectHtml, ObjectType>,
  ): MultiExpectations<ObjectHtml, ObjectType>;
  expect<ObjectHtml extends HTMLElement = HTMLElement, ObjectType = any>(
    objectRef:
      | PartRef<ObjectHtml, ObjectType>
      | MultiPartRef<ObjectHtml, ObjectType>,
  ):
    | SingleExpectations<ObjectHtml, ObjectType>
    | MultiExpectations<ObjectHtml, ObjectType>;
}

interface BaseExpectations {
  debugTest(): void;
}

export type CssClass = string | null | undefined | false;
export type CssClasses = CssClass | CssClass[];

export interface MultiExpectations<ObjectHtml extends HTMLElement, ObjectType>
  extends BaseExpectations {
  not: MultiExpectations<ObjectHtml, ObjectType>;
  /**
   * Allows to pass a custom assertion function that gets called by ngtx at the end of the test case.
   * @param assertion `DeclarativeTestExtension`-function that adds an assertion to the `DeclarativeTestState`.
   */
  to(
    assertion: DeclarativeTestExtension<
      HTMLElement,
      unknown,
      ObjectHtml,
      ObjectType,
      MultiPartRef<ObjectHtml, ObjectType>
    >,
  ): void;
  /**
   * Asserts that the specified objects are to be found in the template. If no options are given, it will
   * assert that at least one of the object-type could be found in the component under test's template.
   *
   * ~~~ts
   * When(host).hasState({ items: [1,2,3] })
   *   .expect(Components.Items).toBeFound({ count: 3 });
   * ~~~
   * @param opts (Optional) finding options specifying more details about the findings.
   */
  toBeFound(opts?: MultipleFindingOptions): void;
  /**
   * Asserts that the found components' states match the given object-property-maps.
   *
   * ---
   * **Please note:** When providing an array as argument, you have to describe all items that will be found during this test.
   * If the number of given property-maps do not match the number of found items, ngtx will throw.
   * ---
   *
   * ~~~ts
   * When(host).hasState({ users: [{ name: 'Ann Ray' }, { name: 'Mary Jane' }] })
   *   .expect(Components.Avatars).toHaveStates([
   *     { initials: 'AR' },
   *     { initials: 'MJ' }
   *   ]);
   * ~~~
   * @param maps Array of objects that provide properties defining the expected component states, in the correct order of finding.
   */
  toHaveStates(
    maps: Partial<PropertyMap<ObjectType>> | Partial<PropertyMap<ObjectType>>[],
  ): void;
  /**
   * Asserts that the found components' native-elements have the specified attributes defined.
   *
   * ---
   * **Please note:** When providing an array as argument, you have to describe all items that will be found during this test.
   * If the number of given property-maps do not match the number of found items, ngtx will throw.
   * ---
   *
   * ~~~ts
   * When(host).hasState({ disabled: true })
   *   .expect(Components.ActionButtons).toHaveAttributes([
   *     { disabled: true },
   *     { disabled: true },
   *   ]);
   * ~~~
   * @param map Array of objects that provide properties defining the expected native-element attributes, in the correct order of finding.
   */
  toHaveAttributes(
    map: Partial<PropertyMap<ObjectHtml>> | Partial<PropertyMap<ObjectHtml>>[],
  ): void;
  /**
   * Asserts that the found components' css classes match the given values.
   *
   * ---
   * **Please note:** When providing an array as argument, you have to describe all items that will be found during this test.
   * If the number of given property-maps do not match the number of found items, ngtx will throw.
   * ---
   *
   * **Please note:** When providing a falsy value as an expectation, it will be skipped. This can be utilized to only
   * check for certain elements from the list of found ones.
   * ---
   *
   * ~~~ts
   * When(host).hasState({ tabs: [{ label: 'A' }, { label: 'B' }], selected: 'A' })
   *   .expect(Components.TabItems).toHaveCssClasses([
   *     ['tab', 'selected'],
   *     'tab',
   *   ]);
   * ~~~
   * @param cssClasses Array of strings or string-sub-arrays that provide the css classes to expect on the respective item.
   */
  toHaveCssClasses(cssClasses: CssClasses[]): void;
  /**
   * Asserts that the found components native elements have the (exact) given text phrase(s).
   *
   * ~~~ts
   * When(host).hasState({ tabs: [{ label: 'Tab A' }, { label: 'Tab B' }], selected: 'Tab A' })
   *   .expect(Components.TabItems)
   *   .toHaveTexts(['Tab A', 'Tab B', 'Tab C']);
   * ~~~
   * @param texts Array of sub-strings to be found in the respective item(s).
   */
  toHaveTexts(texts: string | string[]): void;
  /**
   * Asserts that the found components native elements contain the given text phrase(s).
   *
   * ---
   * **Please note:** When providing an array as argument, you have to describe all items that will be found during this test.
   * If the number of given text-phrases do not match the number of found items, ngtx will throw.
   * ---
   *
   * ~~~ts
   * When(host).hasState({ tabs: [{ label: 'Tab A' }, { label: 'Tab B' }], selected: 'Tab A' })
   *   .expect(Components.TabItems)
   *   .toContainTexts(['A', 'B', 'C']);
   * ~~~
   * @param texts Array of sub-strings to be found in the respective item(s).
   */
  toContainTexts(texts: string | string[]): void;
}

export interface MultipleFindingOptions {
  count?: number;
}

export interface SingleExpectations<ObjectHtml extends HTMLElement, ObjectType>
  extends BaseExpectations {
  not: SingleExpectations<ObjectHtml, ObjectType>;
  /**
   * Allows to pass a custom assertion function that gets called by ngtx at the end of the test case.
   * @param assertion `DeclarativeTestExtension`-function that adds an assertion to the `DeclarativeTestState`.
   */
  to(
    assertion: DeclarativeTestExtension<
      HTMLElement,
      unknown,
      ObjectHtml,
      ObjectType,
      PartRef<ObjectHtml, ObjectType>
    >,
  ): void;
  /**
   * Injects the specified injection token and asserts that the test's **object** calls a method on it.
   * @param targetResolver A `TargetResolverFn` such as `injected`, `componentMethod` or `elementMethod`.
   * @param method The method name that is expected to be called.
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
      unknown,
      any
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
  action: DeclarativeTestExtension<
    SubjectHtml,
    Subject,
    HTMLElement,
    unknown,
    any
  >,
) => AfterPredicateApi<SubjectHtml, Subject>;
