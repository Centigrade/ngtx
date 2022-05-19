import { Type } from '@angular/core';
import { NgtxElement, NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';

export type PropertyMap<T> = T & Record<keyof T, any>;
export type Token<T> = Type<T> | Function;

/**
 * Defines options what aspects of a spy should be asserted.
 *
 * **Example:**
 * ~~~ts
 * ...expect(...).toHaveCalledService(AuthService, 'isLoggedIn', {
 *   args: 'user.name',
 *   times: 1,
 *   whichReturns: true
 * });
 * ~~~
 */
export interface EmissionOptions {
  /** The value that was passed as (only) argument to the spy. */
  args?: any;
  /** The number of times the spy was called. */
  times?: number;
  /** The return-value that the spy should return when being called. */
  whichReturns?: any;
}

/** A function with no parameters returning a `NgtxElement`. */
export type PartRef<Html extends HTMLElement, Type> = () => NgtxElement<
  Html,
  Type
>;

export type EventsOf<T extends string | number | Symbol> =
  T extends `on${infer Suffix}` ? Suffix : never;

/**
 * Contains the current test definition state. Ngtx declarative
 * tests are structured similar to a sentence in human language:
 *
 * `<Subject> <predicate> <object> <assertion>.`
 *
 * Thus, the declarative test state includes exactly these mentioned parts.
 * There is always a subject that has or does something (-> predicate), and
 * an object that will react on it and thus has an assertion defined.
 *
 * This state can be mutated by setting a subject or object to a `PartRef`
 * or by overriding or wrapping the `predicate` or `assertion` function.
 */
export interface DeclarativeTestState<
  SubjectHtml extends HTMLElement,
  Subject,
  ObjectHtml extends HTMLElement,
  Object,
> {
  /** Whether the assertion is preceded by a ".not" and will be negated. */
  negateAssertion?: boolean;
  /**
   * The `subject` of the test case that *has* or *does* something.
   * It will most likely be used in the `predicate` statement that
   * follows the `When` clause.
   *
   * Set the `subject` in the test case for later use in the `predicate`.
   */
  subject?: PartRef<SubjectHtml, Subject>;
  /**
   * The `predicate` of the test case that describes what actions has to
   * be done, before assertions can be made. Override or wrap this function
   * in order to add actions to the test case body. In traditional (AAA)
   * testing this would map to the `arrange` and `act` sections of your test.
   *
   * The predicate will most likely use the before-hand defined `subject` of
   * the declarative test-state to execute the actions on it.
   *
   * **Example:**
   * ~~~ts
   * const disabled = (state: DeclarativeTest, fixture: NgtxFixture) => {
   *   return {
   *     // here we override the predicate of the test-state:
   *     predicate: () => {
   *       state.subject().componentInstance.disabled = true;
   *       fixture.detectChanges();
   *     },
   *   };
   * }
   *
   * // this will set the disabled property on host to true
   * // and detect changes afterwards:
   * When(host).is(disabled).expect(...).to(...);
   * ~~~
   */
  predicate?: () => void;
  /**
   * The `object` of the test case that determines on what target assertions
   * will be made. This part of the state will most likely be used in the
   * `assertion` function to make assertions on it.
   */
  object?: PartRef<ObjectHtml, Object>;
  /**
   * The `assertion` part of the test case. Override or wrap this function in
   * order to run expectations on the test's `object`. In traditional (AAA)
   * testing this would map to the `assert` part of your test.
   *
   * **Example:**
   * ~~~ts
   * const haveFocus = (state: DeclarativeTestState): DeclarativeTestState => {
   *   return {
   *     // here we override the assertion of the test-state:
   *     assertion: () => {
   *        const target = state.object().nativeElement;
   *        expect(document.activeElement).toBe(target);
   *     }
   *   }
   * }
   *
   * const Input = () => get('input');
   * // this will assert that the Input is the activeElement
   * // of the document at the end of the test.
   * When(...).has(...).expect(Input).to(haveFocus);
   * ~~~
   */
  assertion?: () => void;
}

export type TargetResolverFn<
  SubjectHtml extends HTMLElement,
  Subject,
  ObjectHtml extends HTMLElement,
  Object,
  T,
> = (
  state: DeclarativeTestState<SubjectHtml, Subject, ObjectHtml, Object>,
) => ITargetResolver<T>;
export interface ITargetResolver<T> {
  getInstance(): T;
}

export type DeclarativeTestExtension<
  SubjectHtml extends HTMLElement,
  Subject,
  ObjectHtml extends HTMLElement,
  Object,
> = (
  input: DeclarativeTestState<HTMLElement, Subject, ObjectHtml, Object>,
  fixture: NgtxFixture<HTMLElement, any>,
  spyFactory: SpyFactoryFn,
) => DeclarativeTestState<SubjectHtml, Subject, ObjectHtml, Object>;
