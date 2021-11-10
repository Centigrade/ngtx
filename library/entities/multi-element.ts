import { Type } from '@angular/core';
import { ConverterFn, QueryTarget } from '../types';
import { NgtxElement } from './element';

export class NgtxMultiElement<Html extends Element = Element, Component = any> {
  public get length(): number {
    return this.elements.length;
  }

  constructor(private readonly elements: NgtxElement<Html, Component>[]) {}

  public get<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public get<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxMultiElement<Html, Component>;
  public get<Html extends Element, Component>(
    query: QueryTarget<Html, Component>,
  ): NgtxMultiElement<Html, Component> {
    const findings = this.elements
      .map((element) => element.get(query as any))
      .filter(
        (element): element is NgtxElement<Html, Component> => element != null,
      );

    return new NgtxMultiElement(findings);
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
    const results: NgtxElement<Html, Component>[] = [];

    this.elements.forEach((element) => {
      const resultList = element.getAll(queryTarget).elements;
      results.push(...resultList);
    });

    // only provide ngtx element if query could actually find something.
    // this allows tests like: expect(Get.ListItems()).toBeNull();
    return results.length > 0 ? new NgtxMultiElement(results) : null;
  }

  public forEach(
    handler: (element: NgtxElement<Html, Component>, index: number) => any,
  ): void {
    this.elements.forEach((element, i) => handler(element, i));
  }

  public find(
    handler: (element: NgtxElement<Html, Component>, index: number) => boolean,
  ): NgtxElement<Html, Component> {
    return this.elements.find((element, i) => handler(element, i));
  }

  public filter(
    handler: (element: NgtxElement<Html, Component>, index: number) => boolean,
  ): NgtxMultiElement<Html, Component> {
    const filteredElements = this.elements.filter((element, i) =>
      handler(element, i),
    );
    return new NgtxMultiElement(filteredElements);
  }

  public map<Out>(
    handler: (element: NgtxElement<Html, Component>, index: number) => Out,
  ): Out[] {
    return this.elements.map((element, i) => handler(element, i));
  }

  public first(): NgtxElement<Html, Component> {
    return this.elements[0];
  }

  public nth(position: number): NgtxElement<Html, Component> {
    const index = position - 1;
    const debugElement = this.elements[index];
    return debugElement ? debugElement : null;
  }

  public atIndex(index: number): NgtxElement<Html, Component> {
    const debugElement = this.elements[index];
    return debugElement ? debugElement : null;
  }

  public last(): NgtxElement<Html, Component> {
    const itemCount = this.elements.length;
    return this.elements[itemCount - 1];
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
    const values = this.elements.map((debugElement) =>
      debugElement.nativeElement.getAttribute(name),
    );

    return convert ? values.map(convert) : values;
  }

  public textContents(trim = true): string[] {
    return this.elements
      .map((debugElement) => debugElement.nativeElement.textContent)
      .map((text) => (trim ? text.trim() : text));
  }

  public withApi<Api extends NgtxMultiElement>(apiType: Type<Api>): Api {
    return new apiType(this.elements);
  }
}
