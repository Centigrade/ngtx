import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ConverterFn,
  LifeCycleHooks,
  QueryTarget,
  TypedDebugElement,
  TypeObjectMap,
} from './types';
import { queryAll } from './utility';

export class NgtxRootElement {
  private fixture?: ComponentFixture<any>;

  /**
   * **Provides the test helpers with the correct `fixture` instance on which they work.**
   *
   * Call this function in the `beforeEach`-hook in which the fixture is created.
   *
   * ---
   * Use it like that:
   *
   * ~~~ts
   * describe('MyTests', withHelpers({ useFixture, ... }) => {
   *    // ...
   *
   *    beforeEach(() => {
   *        fixture = TestBed.createComponent(MyComponent);
   *        component = fixture.componentInstance;
   *        // use it here. internally it will call fixture.detectChanges()
   *        // so no need to do it after this call again.
   *        useFixture(fixture);
   *    });
   * });
   * ~~~
   * @param fixture The test's `fixture` instance.
   */
  public useFixture<T>(
    fixture: ComponentFixture<any>,
  ): NgtxElement<Element, T> {
    this.fixture = fixture;
    return new NgtxElement(fixture.debugElement);
  }

  /**
   * **Shortcut for `fixture.detectChanges()`.**
   *
   * Optionally accepts a component instance on which then `ngOnInit` and
   * `ngOnChanges` life-cycle hooks are called (however: without any arguments).
   *
   * ---
   *
   * ~~~ts
   * detectChanges();
   * ~~~
   *
   * ---
   * @param component (Optional) A component instance to call the `ngOnInit`- and `ngOnChanges`-life-cycles on.
   */
  public detectChanges<
    Html extends Element = Element,
    Component = any
  >(): NgtxElement<Html, Component>;
  /**
   * **Shortcut for `fixture.detectChanges()`.**
   *
   * Optionally accepts a component instance on which then `ngOnInit` and
   * `ngOnChanges` life-cycle hooks are called (however: without any arguments).
   *
   * ---
   *
   * ~~~ts
   * // runs ngOnInit and ngOnChanges hooks
   * // on component, before detecting changes:
   * detectChanges(component);
   * ~~~
   *
   * ---
   * @param component (Optional) A component instance to call the `ngOnInit`- and `ngOnChanges`-life-cycles on.
   */
  public detectChanges<
    T extends LifeCycleHooks,
    Html extends Element = Element
  >(component: T, changes?: TypeObjectMap<T>): NgtxElement<Html, T>;
  public detectChanges<
    T extends LifeCycleHooks,
    Html extends Element = Element
  >(component?: T, changes?: TypeObjectMap<T>): NgtxElement<Html, T> {
    if (component) {
      component?.ngOnChanges(changes);
      component?.ngOnInit();
    }

    this.fixture.detectChanges();

    // hint: we trust the user to pass in the correct component type here:
    return (this as unknown) as NgtxElement<Html, T>;
  }
}

export class NgtxElement<Html extends Element = Element, Component = any> {
  constructor(
    private readonly debugElement?: TypedDebugElement<Html, Component>,
  ) {}

  /**
   * **Finds an element by css-selector like a class-name, id, tag-name or even a mix of all.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * const debugElement = find('button.active');
   * ~~~
   * ---
   *
   * **Please Note:** if you want to give the nativeElement another type than the
   * default `HTMLElement`, you can specify the generic parameter of this function:
   *
   * ~~~ts
   * // => make nativeElement of type HTMLButtonElement:
   * const { nativeElement } = find<HTMLButtonElement>('button.active');
   * ~~~
   *
   * ---
   * @param cssSelector A css-selector describing your wanted element.
   */
  public find<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxElement<Html, Component>;
  /**
   * **Finds the first element of the specified component class.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * const debugElement = find(MyComponent);
   * ~~~
   * ---
   * @param component A component class to search for.
   */
  public find<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxElement<Html, Component>;
  public find<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): NgtxElement<Html, Component> {
    const debugElement: TypedDebugElement<Html, Component> =
      typeof query === 'string'
        ? this.debugElement.query(By.css(query))
        : this.debugElement.query(By.directive(query));

    return new NgtxElement(debugElement);
  }

  /**
   * **Finds all elements matching your specified css-selector.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElements`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * const debugElements = findAll('button.active');
   * ~~~
   * ---
   * @param cssSelector A css-selector describing your wanted elements.
   */
  public findAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxElement<Html, Component>[];
  /**
   * **Finds all elements matching your specified css-selector.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElements`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * const debugElements = findAll(['button.active', 'button.disabled', TooltipComponent]);
   * ~~~
   * ---
   * @param queryTarget A single Type or css-selector or an array of them to search for.
   * @param convert A converter function that takes the `DebugElement` and converts it into anything other.
   */
  public findAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component> | QueryTarget<Html, Component>[],
  ): NgtxElement<Html, Component>[];
  public findAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component> | QueryTarget<Html, Component>[],
  ): NgtxElement<Html, Component>[] {
    const queriesAsArray = Array.isArray(queryTarget)
      ? queryTarget
      : [queryTarget];

    const results: TypedDebugElement<Html, Component>[] = [];

    for (const query of queriesAsArray) {
      const resultList = queryAll(query, this.debugElement!);
      results.push(...resultList);
    }

    return results.map((debugElement) => new NgtxElement(debugElement));
  }

  /**
   * Gets the attribute with the specified name on the current element.
   *
   * ---
   * **Example:**
   * ~~~ts
   * const title = find('.submit-btn').attr('title');
   * ~~~
   * @param name The name of the attribute to get on the current element.
   */
  public attr(name: string): string;
  /**
   * Gets the attribute with the specified name on the current element and converts
   * it using the given conversion function.
   * ---
   * **Example:**
   * ~~~ts
   * // parses the stringified data in the dialogs data-result attribute
   * // and returns the result:
   * const dialogResult = find('.dialog').attr('data-result', JSON.parse);
   * ~~~
   * @param name The name of the attribute to get on the current element.
   * @param convert A conversion function to apply before returning the value.
   */
  public attr<Out>(name: string, convert: ConverterFn<Out>): Out;
  public attr<Out>(name: string, convert?: ConverterFn<Out>): string | Out {
    const value = this.debugElement.nativeElement.getAttribute(name);
    return convert ? convert(value) : value;
  }
}
