import { DebugElement, SimpleChanges, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { NgtxElement, NgtxFixture } from '../core';
import { WhenStatement } from '../declarative-testing/types';

export interface NgtxGlobalConfig {
  defaultSpyFactory: SpyFactoryFn;
}

export type Maybe<T> = T | undefined | null;

export type NgtxSuite<T> = Omit<
  NgtxFixture<any, any>,
  'rootElement' | 'useFixture'
> & {
  /**
   * Initializes ngtx enabling all its features. Call this function after creating your
   * component under test with the result of `TestBed.createComponent(TheComponentUnderTest)`.
   * @param fixture The test fixture created by calling `TestBed.createComponent(...)`.
   * @param options An object defining additional options how to initialize ngtx.
   */
  useFixture(fixture: ComponentFixture<T>, opts?: UseFixtureOptions): void;
  /**
   * Initializes ngtx enabling all its features. Call this function after creating your
   * component under test with the result of `TestBed.createComponent(TheComponentUnderTest)`.
   * @param fixture The test fixture created by calling `TestBed.createComponent(...)`.
   * @param skipInitialChangeDetection Whether to skip the initial `fixture.detectChanges()` call.
   * @deprecated Please pass an options-object as second parameter. Passing a boolean is deprecated and will be removed in a future major version. Rather use: `useFixture(fixture, { skipInitialChangeDetection: true })`
   */
  useFixture(
    fixture: ComponentFixture<T>,
    skipInitialChangeDetection?: boolean,
  ): void;
  When: WhenStatement;
  host(): NgtxElement<HTMLElement, T>;
};

/** Defines options that affects how ngtx gets initialized. */
export interface UseFixtureOptions {
  /**
   * Whether the initial `fixture.detectChanges()` call should be skipped.
   * This allows you to set additional properties on your component-under-test,
   * before making Angular reflect these changes.
   *
   * Example:
   * ~~~ts
   * // ...
   * const fixture = TestBed.createComponent(ExpanderComponent);
   * useFixture(fixture, { skipInitialChangeDetection: true });
   * fixture.componentInstance.open = true;
   * detectChanges();
   * ~~~
   */
  skipInitialChangeDetection?: boolean;
  /**
   * > **Note:** This is only needed for [declarative testing](https://github.com/Centigrade/ngtx/blob/main/docs/GOOD_TESTS.md#Declarative-Testing).
   * >
   * > In other scenarios this option will have no effect and use.
   *
   * Allows you to pass a test-spy factory function, that ngtx will use in declarative testing
   * scenarios, whenever it needs to [spy](https://www.amadousall.com/unit-testing-angular-stubs-vs-spies-vs-mocks#thedifferencesbetweenstubsspiesandmocks) on something.
   */
  spyFactory?: SpyFactoryFn;
}

/**
 * A factory function that takes an optional `returnValue`-value as input and returns a testing-framework specific `spy`
 * as output. This spy is expected to return the value as defined in the first parameter.
 *
 * **Example**:
 * ~~~ts
 * // for jasmine:
 * const jasmineSpyFactory = (returnValue?: any) => jasmine.createSpy().and.returnValue(returnValue);
 * // for jest:
 * const jestSpyFactory = (returnValue?: any) => jest.fn(() => returnValue);
 * ~~~
 */
export type SpyFactoryFn = (returnValue?: any) => any;

export type Fn<In extends any[] = any[], Out = any> = (a: In) => Out;
export type ConverterFn<Out> = Fn<any, Out>;

/** Defines a directive's API that uses Angular's LifeCycleHooks. */
export interface LifeCycleHooks {
  ngOnInit?: () => void;
  ngOnChanges?: (changes: SimpleChanges) => void;
}

/** A css selector string. */
export type CssSelector = string;
/** A query-target defines in which way ngtx can search for template parts. */
export type QueryTarget<Component> = CssSelector | Type<Component>;

/** An improved version of Angular's `DebugElement` that can actually handle proper typing. */
export interface TypedDebugElement<
  Html extends HTMLElement = HTMLElement,
  Component = any,
> extends DebugElement {
  nativeElement: Html;
  componentInstance: Component;
}

/** Describes an object that has at least a subset of the properties of type `T` with `any` value, */
export type TypeObjectMap<K> = Partial<{
  [P in keyof Partial<K>]: any;
}>;
