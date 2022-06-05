import { Type } from '@angular/core';
import { NgtxElement, NgtxFixture } from '../entities';
import { SpyFactoryFn } from '../types';

export type Maybe<T> = T | undefined | null;
export type PropertyMap<T> = T & Record<keyof T, any>;
export type Token<T> = Type<T> | Function;
export type PropertyState<T> = Partial<PropertyMap<T>>;
export type Events<Html extends HTMLElement, Type> =
  | EventEmitterOf<Type>
  | EventsOf<keyof Html>;
export type EventEmitterOf<Type> = {
  [P in keyof Type]: Type[P] extends { emit: Function } ? P : never;
}[keyof Type];

export interface CallBaseOptions {
  /** The number of times the spy was called. */
  times?: number | null;
}

export interface CallOptions extends CallBaseOptions {
  /** The values that were passed as arguments to the spy. */
  args?: any[];
  /** The return-value that the spy should return when being called. */
  whichReturns?: any;
}

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
export interface EmissionOptions extends CallBaseOptions {
  arg?: any;
}

export type NgtxList<T> = T[] & {
  nth(pos: number): T;
  first(): T;
  last(): T;
};

export type TargetRef<Html extends HTMLElement, Type> = () =>
  | NgtxElement<Html, Type>
  | NgtxElement<Html, Type>[];

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
export interface DeclarativeTestState {
  /** Whether the assertion is preceded by a ".not" and will be negated. */
  negateAssertion?: boolean;
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
  predicate?: (() => void)[];
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
  assertion?: (() => void)[];
}

export interface SpyRegisterEntry {
  done: boolean;
  host: () => any;
  methodName: string;
  spy: any;
}
export type SpyOnFn = <T>(
  host: () => T,
  methodName: keyof PublicApi<T>,
  spyReturnValue?: any,
) => any;

export type ITargetResolver<Html extends HTMLElement, Type, Output> = (
  target: NgtxElement<Html, Type>,
) => Output;
export interface ISetSpyFactory {
  setSpyFactory(fn: any): void;
}

export type DeclarativeTestExtension<Html extends HTMLElement, Type> = (
  target: TargetRef<Html, Type>,
  input: DeclarativeTestState,
  fixture: NgtxFixture<HTMLElement, any>,
  spyFactory: SpyFactoryFn,
) => DeclarativeTestState;

type AllowType<Base, Type> = {
  [Key in keyof Base]: Base[Key] extends Type ? Key : never;
};
type AllowedNames<Base, Type> = AllowType<Base, Type>[keyof Base];
type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;
export type PublicApi<T> = OmitType<T, Function>;
export type PublicMembers<T> = OmitType<T, any>;
