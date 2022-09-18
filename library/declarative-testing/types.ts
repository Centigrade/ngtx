import { Type } from '@angular/core';
import { NgtxElement, NgtxFixture, NgtxMultiElement } from '../core';
import { NgtxTestState } from './symbols';
import type { NgtxTestEnv } from './test-env';

//#region internal types
type ChainedStatement<Html extends HTMLElement, Component> = (
  testStatement: TestStateExporter,
) => ExpectApi<Html, Component>;

type PredicateReceiver<Html extends HTMLElement, Component> = (
  // hint: Required<Component> to normalize Component's type, so that extension-fns
  // using "keyof Component" can safely use all of them, even keys being optional (e.g. age?: number).
  ...predicates: ExtensionFn<Html, Required<Component>>[]
) => ExpectApi<Html, Component>;

interface EmitPredicate<Html extends HTMLElement, Component> {
  (resolver: EventDispatcher, arg?: any): ExpectApi<Html, Component>;
  (eventName: Events<Html, Component>, arg?: any): ExpectApi<Html, Component>;
}
type CallPredicate<Html extends HTMLElement, Component> = <Out>(
  resolver: TargetResolver<Html, Component, Out>,
  methodName: keyof Out,
  args?: any[],
) => ExpectApi<Html, Component>;

type AllowType<Base, Type> = {
  [Key in keyof Base]: Base[Key] extends Type ? Key : never;
};
type AllowedNames<Base, Type> = AllowType<Base, Type>[keyof Base];
type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;
//#endregion

/* 
  We use ExtensionMarker type to uniquely mark user defined functions as extension functions.
  This helps preventing confusing factory-functions creating the extension with the extension
  itself.

  Example:

  Imagine we have the beMissing function factory like that
  > const beMissing = () => (...) => { addAssertion(...) };

  Now in the tests we use it:

  > When(host)...expect(...).to(beMissing());

  This code will work as expected and of course there are no typing issues. The problem
  occurs when the user forgets to call the factory function like that:

  > ...expect(...).to(beMissing);

  In this code example typings still work, as () => is assignable to the ExtensionFn type.
  To prevent this, we mark extension functions with a special symbol, so that typescript error
  can show the mistake.
*/
export type ExtensionFnMarker = { __ngtxExtensionFn: true };
export type ExtensionFnSignature<Html extends HTMLElement, Component> = (
  target: ElementListRef<Html, Component>,
  env: NgtxTestEnv,
  fixture: NgtxFixture<HTMLElement, any>,
) => void;
export type ExtensionFn<
  Html extends HTMLElement,
  Component,
> = ExtensionFnSignature<Html, Component> & ExtensionFnMarker;
export type TestStateExporter = {
  [NgtxTestState]: NgtxTestEnv;
};

export type CssClass = string | undefined;
export type TargetResolver<Html extends HTMLElement, Type, Output> = (
  target: NgtxElement<Html, Type>,
) => Output;

/** Describes a property name. */
export interface PropertyDescriptor<
  Component,
  PropertyKey extends keyof Component,
> {
  name: Partial<PropertyKey>;
}

/** Describes a property which can be passed to template methods inherited from ngtx' `Capability<T>` class. */
export interface PropertyValueDescriptor<
  Component,
  PropertyKey extends keyof Component,
> extends PropertyDescriptor<Component, PropertyKey> {
  /** The property's name, whose value will be asserted or set. */
  name: PropertyKey;
  /** Whether the property expects an array as value (~ is of type `T[]`) */
  isArrayProperty?: boolean;
  /** The default, expected value when it comes to asserting the property. */
  defaultSetterValue?: Component[PropertyKey];
  /** The default, set value when setting the property. */
  defaultAssertionValue?: Component[PropertyKey];
}

export interface SpyFactorySetter {
  setSpyFactory(fn: any): void;
}

export type SubjectStatement = <Html extends HTMLElement, Component>(
  subject: TargetRef<Html, Component>,
) => PredicateApi<Html, Component>;

export type WhenStatement = SpyFactorySetter &
  SubjectStatement &
  ChainedStatement<HTMLElement, any>;

export type AndStatement<
  Html extends HTMLElement,
  Component,
> = PredicateReceiver<Html, Component> & // and(...extFns)...
  WhenStatement; // and(host)... // and(When(...).does(...))...

export type EventDispatcher = <Html extends HTMLElement, Component>(
  subject: NgtxElement<Html, Component>,
) => void;

export interface PredicateApi<Html extends HTMLElement, Component> {
  /**
   * Predicate emitting the specified event on the pre-defined target:
   *
   * > **Please note:** The `emits` method is just an alias for `emit`. They can be used interchangeably.
   * > ~~~ts
   * > When(host).emit(...)...
   * > // is the same as:
   * > When(host).emits(...)...
   * > ~~~
   *
   * #### Example 1 - without event-arg:
   * ~~~ts
   */
  emit: EmitPredicate<Html, Component>;
  emits: EmitPredicate<Html, Component>;

  /**
   * Predicate calling the specified method. The call-target as well as the method-name will be selected via parameters.
   *
   * > **Please note:** The examples uses the concept of test-harness classes. You can read more about it [here](https://github.com/Centigrade/ngtx/blob/experimental/capabilities/docs/GOOD_TESTS.md).
   *
   * > **Please note:** The `calls` method is just an alias for `call`. They can be used interchangeably.
   * > ~~~ts
   * > When(host).call(...)...
   * > // is the same as:
   * > When(host).calls(...)...
   * > ~~~
   *
   * #### Example 1 - method on the target's nativeElement:
   *
   * ~~~ts
   * import { nativeMethod } from '@centigrade/ngtx';
   * // target is the.Button's nativeElement,
   * // only arg is the options object:
   * When(the.Button)
   *  .calls(nativeMethod, 'scrollIntoView', [{ behavior: 'smooth' }])...
   * ~~~
   *
   * #### Example 2 - method on a componentInstance:
   *
   * ~~~ts
   * import { componentMethod } from '@centigrade/ngtx';
   * // target is the.Button's componentInstance
   * When(the.Button).calls(componentMethod, 'click')...
   * ~~~
   *
   * #### Example 3 - method on a service or injected token:
   *
   * ~~~ts
   * import { injected } from '@centigrade/ngtx';
   * // target is the host's injector:
   * When(host)
   *  .calls(injected(SomeService), 'someMethodOnService')...
   * ~~~
   */
  call: CallPredicate<Html, Component>;
  /**
   * Predicate calling the specified method. The call-target as well as the method-name will be selected via parameters.
   *
   * > **Please note:** The examples uses the concept of test-harness classes. You can read more about it [here](https://github.com/Centigrade/ngtx/blob/experimental/capabilities/docs/GOOD_TESTS.md).
   *
   * > **Please note:** The `calls` method is just an alias for `call`. They can be used interchangeably.
   * > ~~~ts
   * > When(host).call(...)...
   * > // is the same as:
   * > When(host).calls(...)...
   * > ~~~
   *
   * #### Example 1 - method on the target's nativeElement:
   *
   * ~~~ts
   * import { nativeMethod } from '@centigrade/ngtx';
   * // target is the.Button's nativeElement,
   * // only arg is the options object:
   * When(the.Button)
   *  .calls(nativeMethod, 'scrollIntoView', [{ behavior: 'smooth' }])...
   * ~~~
   *
   * #### Example 2 - method on a componentInstance:
   *
   * ~~~ts
   * import { componentMethod } from '@centigrade/ngtx';
   * // target is the.Button's componentInstance
   * When(the.Button).calls(componentMethod, 'click')...
   * ~~~
   *
   * #### Example 3 - method on a service or injected token:
   *
   * ~~~ts
   * import { injected } from '@centigrade/ngtx';
   * // target is the host's injector:
   * When(host)
   *  .calls(injected(SomeService), 'someMethodOnService')...
   * ~~~
   */
  calls: CallPredicate<Html, Component>;

  /** A predicate doing nothing. You can use this if the test is already set-up from the very beginning. */
  rendered(): ExpectApi<Html, Component>;
  has: PredicateReceiver<Html, Component>;
  have: PredicateReceiver<Html, Component>;
  does: PredicateReceiver<Html, Component>;
  do: PredicateReceiver<Html, Component>;
  gets: PredicateReceiver<Html, Component>;
  get: PredicateReceiver<Html, Component>;
  is: PredicateReceiver<Html, Component>;
  are: PredicateReceiver<Html, Component>;
}

export interface ExpectApi<Html extends HTMLElement, Component>
  extends TestStateExporter {
  /**
   * Allows to chain additional statement(s) to the test-expression:
   *
   * Example 1 - with targeted statement:
   *
   * ~~~ts
   * When(host)
   *   .has(state({ text: 'Hi' }))
   *   .and(the.ClearButton)
   *   .gets(clicked())
   *   .expect(host)
   *   .to(haveState({ text: '' }));
   * ~~~
   *
   * Example 2 - with extension-function(s) only:
   *
   * ~~~ts
   * When(host)
   *   .has(state({ label: 'Welcome' }))
   *   .and(detectChanges({ viaChangeDetectorRef: true }))
   *   .expect(the.Label)
   *   .to(haveText({ label: 'Welcome' }));
   * ~~~
   *
   * Example 3 - with capability api:
   *
   * ~~~ts
   * When(host)
   *   .has(state({ text: 'Hi' }))
   *   .and(the.ClearButton.getsClicked())
   *   .expect(host)
   *   .to(haveText({ text: '' }));
   * ~~~
   *
   */
  and: AndStatement<Html, Component>;
  expect<Html extends HTMLElement, Component>(
    object: TargetRef<Html, Component>,
  ): AssertionApi<Html, Component>;
  expect<Html extends HTMLElement, Component>(assertion: NgtxTestEnv): void;
}

export interface AssertionApi<Html extends HTMLElement, Component>
  extends TestStateExporter {
  not: AssertionApi<Html, Component>;
  /**
   * Accepts [asserting extension-functions](https://github.com/Centigrade/ngtx/blob/experimental/capabilities/docs/declarative-api/assertions/index.md),
   * and immediately triggers the test expression to run. You want to use this behavior inside ngtx test-cases:
   *
   * **Example**
   *
   * ~~~ts
   * it('should render the label text', () => {
   *  When(host).has(state({ label: 'Welcome' })).expect(the.Label).to(haveText('Welcome'));
   * });
   * ~~~
   * @param assertions The assertion(s) to register for this test.
   */
  to(...assertions: ExtensionFn<Html, Required<Component>>[]): void;
  /**
   * Accepts [asserting extension-functions](https://github.com/Centigrade/ngtx/blob/experimental/capabilities/docs/declarative-api/assertions/index.md), but does not immediately trigger the test expression to run.
   * You want to use this behavior for ngtx' capabilities classes:
   *
   * **Example**
   *
   * ~~~ts
   * import { Capabilities } from '@centigrade/ngtx';
   *
   * export class ButtonCapability extends Capabilities<ButtonComponent> {
   *    public toHaveText(expectedText: string | string[]) {
   *      return this.expectComponents.will(haveText(expectedText));
   *    }
   * }
   * ~~~
   * @param assertions The assertion(s) to register for this test.
   */
  will(...assertions: ExtensionFn<Html, Required<Component>>[]): NgtxTestEnv;
}
export type IHaveLifeCycleHook = {
  ngAfterViewInit?: Function;
  ngAfterContentInit?: Function;
  ngOnInit?: Function;
  ngOnChanges?: Function;
  ngOnDestroy?: Function;
};

export type ElementList<Html extends HTMLElement, Component> = NgtxElement<
  Html,
  Component
>[];

export type ElementListRef<
  Html extends HTMLElement,
  Component,
> = () => ElementList<Html, Component>;

export type Token<T> = Type<T> | Function;
export type PropertiesOf<T> = Partial<T & Record<keyof T, any>>;
export type Events<Html extends HTMLElement, Type> =
  | keyof Type
  | HtmlEvents<keyof Html>;

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

export type TargetRef<Html extends HTMLElement, Type> = () =>
  | NgtxElement<Html, Type>
  | NgtxMultiElement<Html, Type>;

export type NgtxElementRef<Html extends HTMLElement, Type> = () => NgtxElement<
  Html,
  Type
>;
export type NgtxMultiElementRef<
  Html extends HTMLElement,
  Type,
> = () => NgtxMultiElement<Html, Type>;

export type HtmlEvents<T extends string | number | Symbol> =
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
  predicate: (() => void)[];
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
  assertion: (() => void)[];
  spyRegistry: SpyRegisterEntry[];
}

export interface SpyRegisterEntry {
  done: boolean;
  host: () => any;
  methodName: string;
  spy: any;
}
export type SpyOnFn = <T>(
  host: () => T,
  methodName: keyof T,
  spyReturnValue?: any,
) => any;

export type PublicApi<T> = OmitType<T, Function>;
export type PublicMembers<T> = OmitType<T, any>;
