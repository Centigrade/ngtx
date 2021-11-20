import { Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ConverterFn, QueryTarget, TypedDebugElement } from '../types';
import { isNgtxQuerySelector, printHtml, queryAll } from '../utility';
import { queryNgtxMarker } from '../utility/query-ngtx-marker';
import { NgtxMultiElement } from './multi-element';

export class NgtxElement<Html extends Element = Element, Component = any> {
  public get nativeElement(): Html {
    return this.debugElement.nativeElement;
  }
  public get component() {
    return this.debugElement.componentInstance;
  }
  public get injector() {
    return this.debugElement.injector;
  }

  constructor(
    public readonly debugElement: TypedDebugElement<Html, Component>,
  ) {}

  public withApi<Api>(apiType: Type<Api>): Api {
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
      isNgtxQuerySelector(query)
        ? queryNgtxMarker(query as string, this.debugElement)
        : typeof query === 'string'
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
    const results: NgtxElement<Html, Component>[] = [];
    const resultList = queryAll(queryTarget, this.debugElement!);
    const elements = resultList.map((r) => new NgtxElement(r));
    results.push(...elements);

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

  debug(): void {
    console.log(printHtml(this.debugElement.nativeElement));
  }
}
