import { DebugElement, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { isDebugElement, isNativeElement } from './type-guards';
import {
  ConverterFn,
  LifeCycleHooks,
  QueryTarget,
  TypedDebugElement,
  TypeObjectMap,
} from './types';
import { printHtml, queryAll } from './utility';

export class NgtxRootElement {
  constructor(private fixture?: ComponentFixture<any>) {}

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
  ): TypedDebugElement<Element, T> {
    this.fixture = fixture;
    return fixture.debugElement;
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
    Component = any,
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
    Html extends Element = Element,
  >(component: T, changes?: TypeObjectMap<T>): NgtxElement<Html, T>;
  public detectChanges<
    T extends LifeCycleHooks,
    Html extends Element = Element,
  >(component?: T, changes?: TypeObjectMap<T>): NgtxElement<Html, T> {
    if (component) {
      component?.ngOnChanges(changes);
      component?.ngOnInit();
    }

    this.fixture.detectChanges();

    // hint: we trust the user to pass in the correct component type here:
    return this as unknown as NgtxElement<Html, T>;
  }

  /**
   * **Prints out the html tree of the specified element.**
   *
   * If no element is given, the fixture's root NativeElement is used as root.
   *
   * ---
   *
   * ~~~ts
   * debug();
   * debug('.my-button');
   * debug(MyButton);
   *
   * const debugElement = find(MyButton);
   * debug(debugElement);
   *
   * const { nativeElement } = find(MyButton);
   * debug(nativeElement);
   * ~~~
   *
   * ---
   * @param root The root element to print the html from. Can be a Type, css-selector, DebugElement or NativeElement.
   */
  debug<Component, Html extends Element>(
    root?: DebugElement | Element | QueryTarget<Html, Component>,
  ): void {
    const rootElem = root ?? this.fixture.nativeElement;
    const element = isNativeElement(rootElem)
      ? rootElem
      : this.resolveDebugElement(rootElem);
    console.log(printHtml(element));
  }

  private resolveDebugElement<Html extends Element, Component>(
    queryTarget: DebugElement | QueryTarget<Html, Component>,
  ) {
    if (isDebugElement(queryTarget)) {
      return queryTarget;
    }

    const ngtxElement = new NgtxElement(this.fixture.debugElement);
    const queryResult = ngtxElement.get(queryTarget as any);
    return queryResult.debugElement;
  }
}

export class NgtxElement<Html extends Element = Element, Component = any> {
  public debugElement: TypedDebugElement<Html, Component>;
  public get nativeElement(): Html {
    return this.debugElement.nativeElement;
  }
  public get component() {
    return this.debugElement.componentInstance;
  }

  constructor(_debugElement?: TypedDebugElement<Html, Component>) {
    this.debugElement = _debugElement;
  }

  public withApi<Api extends NgtxElement>(apiType: Type<Api>): Api {
    return new apiType(this.debugElement);
  }

  public get<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxElement<Html, Component>;
  public get<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxElement<Html, Component>;
  public get<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): NgtxElement<Html, Component> {
    const debugElement: TypedDebugElement<Html, Component> =
      typeof query === 'string'
        ? this.debugElement.query(By.css(query))
        : this.debugElement.query(By.directive(query));

    // only provide an ngtx element if the query could be resolved.
    // this allows tests like: expect(Get.Icon()).toBeNull();
    return debugElement ? new NgtxElement(debugElement) : null;
  }

  public getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component> {
    const results: TypedDebugElement<Html, Component>[] = [];
    const resultList = queryAll(queryTarget, this.debugElement!);
    results.push(...resultList);

    // only provide ngtx element if query could actually find something.
    // this allows tests like: expect(Get.ListItems()).toBeNull();
    return results.length > 0 ? new NgtxMultiElement(results) : null;
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

  public triggerEvent(name: string, eventArgs?: any): void {
    this.debugElement.triggerEventHandler(name, eventArgs);
  }

  public textContent(trim = true): string {
    const text = this.debugElement.nativeElement.textContent;
    return trim ? text.trim() : text;
  }
}

export class NgtxMultiElement<Html extends Element = Element, Component = any> {
  public get length(): number {
    return this.debugElements.length;
  }

  constructor(
    private readonly debugElements: TypedDebugElement<Html, Component>[],
  ) {}

  public get<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public get<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxMultiElement<Html, Component>;
  public get<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component> {
    const debugElements: TypedDebugElement<Html, Component>[] =
      typeof query === 'string'
        ? this.debugElements.map((debugElem) => debugElem.query(By.css(query)))
        : this.debugElements.map((debugElem) =>
            debugElem.query(By.directive(query)),
          );

    const onlyDefined = debugElements.filter((element) => element != null);
    return new NgtxMultiElement(onlyDefined);
  }

  public getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component> {
    const results: TypedDebugElement<Html, Component>[] = [];

    this.debugElements.forEach((debugElement) => {
      const resultList = queryAll(queryTarget, debugElement);
      results.push(...resultList);
    });

    // only provide ngtx element if query could actually find something.
    // this allows tests like: expect(Get.ListItems()).toBeNull();
    return results.length > 0 ? new NgtxMultiElement(results) : null;
  }

  public forEach(
    handler: (element: NgtxElement<Html, Component>, index: number) => any,
  ): void {
    this.debugElements.forEach((element, i) => {
      const ngtxElement = element ? new NgtxElement(element) : null;
      handler(ngtxElement, i);
    });
  }

  public find(
    handler: (element: NgtxElement<Html, Component>, index: number) => boolean,
  ): NgtxElement<Html, Component> {
    return this.debugElements
      .map((element) => new NgtxElement(element))
      .find((element, i) => {
        return handler(element, i);
      });
  }

  public filter(
    handler: (element: NgtxElement<Html, Component>, index: number) => boolean,
  ): NgtxMultiElement<Html, Component> {
    return new NgtxMultiElement(
      this.debugElements.filter((element, i) => {
        return handler(new NgtxElement(element), i);
      }),
    );
  }

  public map<Out>(
    handler: (element: NgtxElement<Html, Component>, index: number) => Out,
  ): Out[] {
    return this.debugElements.map((element, i) => {
      return handler(new NgtxElement(element), i);
    });
  }

  public first(): NgtxElement<Html, Component> {
    return new NgtxElement(this.debugElements[0]);
  }

  public nth(position: number): NgtxElement<Html, Component> {
    const debugElement = this.debugElements[position - 1];
    return debugElement ? new NgtxElement(debugElement) : null;
  }

  public atIndex(index: number): NgtxElement<Html, Component> {
    const debugElement = this.debugElements[index];
    return debugElement ? new NgtxElement(debugElement) : null;
  }

  public last(): NgtxElement<Html, Component> {
    const itemCount = this.debugElements.length;
    return new NgtxElement(this.debugElements[itemCount - 1]);
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
  public attr(name: string): string[];
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
  public attr<Out>(name: string, convert: ConverterFn<Out>): Out[];
  public attr<Out>(name: string, convert?: ConverterFn<Out>): string[] | Out[] {
    const values = this.debugElements.map((debugElement) =>
      debugElement.nativeElement.getAttribute(name),
    );

    return convert ? values.map(convert) : values;
  }

  public textContents(trim = true): string[] {
    return this.debugElements
      .map((debugElement) => debugElement.nativeElement.textContent)
      .map((text) => (trim ? text.trim() : text));
  }

  public withApi<Api extends NgtxMultiElement>(apiType: Type<Api>): Api {
    return new apiType(this.debugElements);
  }
}
