import { Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ConverterFn, QueryTarget, TypedDebugElement } from '../types';
import { queryAll } from '../utility';
import { NgtxElement } from './element';

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
