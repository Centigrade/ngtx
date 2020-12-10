import { DebugElement, SimpleChanges, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { hex } from 'chalk';

export interface TypedDebugElement<Component, HTMLElement = HTMLUnknownElement>
  extends DebugElement {
  nativeElement: HTMLElement;
  componentInstance: Component;
}

export type QueryTarget<Component, Html extends HTMLElement> =
  | string
  | TypedDebugElement<Component, Html>
  | Type<Component>;
export type Fn<In, Out> = (a: In) => Out;

export interface LifeCycleHooks {
  ngOnInit?: () => void;
  ngOnChanges?: (changes?: SimpleChanges) => void;
}

export interface TestHelpers {
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
  debug<Component, Html extends HTMLElement>(root?: QueryTarget<Component, Html>): void;
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
  useFixture<T extends ComponentFixture<any>>(fixture: T): void;
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
  detectChanges(): void;
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
  detectChanges<T extends LifeCycleHooks>(component: T): void;

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
  find<Html extends HTMLElement>(cssSelector: string): TypedDebugElement<any, Html>;
  /**
   * **Finds an element by css-selector like a class-name, id, tag-name or even a mix of all.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * import { toNativeElement } from '../helpers';
   *
   * const nativeElement = find('button.active', toNativeElement);
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
   * @param cssSelector A css-selector describing your wanted elemment.
   * @param convert A converter function that takes the `DebugElement` and converts it into anything other.
   */
  find<Html extends HTMLElement, Out>(
    cssSelector: string,
    convert: (arg: TypedDebugElement<any, Html>) => Out,
  ): Out;
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
  find<Html extends HTMLElement, Component>(
    component: Type<Component>,
  ): TypedDebugElement<Component, Html>;
  /**
   * **Finds the first element of the specified component class.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * import { toNativeElement } from '../helpers';
   *
   * const nativeElement = find(MyComponent, toNativeElement);
   * ~~~
   * ---
   * @param component A component class to search for.
   * @param convert A converter function that takes the `DebugElement` and converts it into anything other.
   */
  find<Html extends HTMLElement, Component, Out>(
    component: Type<Component>,
    convert: (arg: TypedDebugElement<Component, Html>) => Out,
  ): Out;

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
  findAll<Html extends HTMLElement>(cssSelector: string): TypedDebugElement<any, Html>[];
  /**
   * **Finds all elements matching your specified css-selector.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElements`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * import { toNativeElements } from '../helpers';
   *
   * const nativeElements = findAll('button.active', toNativeElements);
   * ~~~
   * ---
   * @param cssSelector A css-selector describing your wanted elements.
   */
  findAll<Html extends HTMLElement, Out>(
    cssSelector: string,
    convert: (arg: TypedDebugElement<any, Html>[]) => Out,
  ): Out;
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
  findAll<Html extends HTMLElement, Component>(
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
  ): TypedDebugElement<Component, Html>[];
  /**
   * **Finds all elements matching your specified css-selector.**
   *
   * Accepts an optional converter function as second parameter.
   * There is a built-in `toNativeElements`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * import { toNativeElements } from '../helpers';
   *
   * const nativeElements = findAll(['button.active', 'button.disabled', TooltipComponent], toNativeElements);
   * ~~~
   * ---
   * @param queryTarget A single Type or css-selector or an array of them to search for.
   */
  findAll<Html extends HTMLElement, Component, Out>(
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    convert: (arg: TypedDebugElement<Component, Html>[]) => Out,
  ): Out;

  /**
   * **Finds an element based on a condition it must meet and a query-target.**
   *
   * Accepts an optional converter function as third parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * const debugElement =
   *            findWhere(
   *                element => element.classes.active !== undefined,
   *                ['button', '.item', TagComponent],
   *             );
   * ~~~
   * ---
   * @param condition The condition the wanted element must meet.
   * @param queryTarget A Type or css-selector describing elements to search in.
   */
  findWhere<Html extends HTMLElement, Component>(
    condition: Fn<TypedDebugElement<Component, Html>, boolean>,
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
  ): TypedDebugElement<Component, Html>;
  /**
   * **Finds an element based on a condition it must meet and a query-target.**
   *
   * Accepts an optional converter function as third parameter.
   * There is a built-in `toNativeElement`-function to use as converter function.
   *
   * ---
   * ~~~ts
   * import { toNativeElement } from '../helpers';
   *
   * const nativeElement =
   *            findWhere(
   *                element => element.classes.active !== undefined,
   *                ['button', '.item', TagComponent],
   *                toNativeElement,
   *             );
   * ~~~
   * ---
   * @param condition The condition the wanted element must meet.
   * @param queryTarget A Type or css-selector describing elements to search in.
   * @param converter A function converting the found element into something else.
   */
  findWhere<Html extends HTMLElement, Component, Out>(
    condition: Fn<TypedDebugElement<Component, Html>, boolean>,
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    converter: Fn<TypedDebugElement<Component, Html>, Out>,
  ): Out;

  /**
   * **Gets the specified attribute from the given query-target.**
   *
   * If the query-target is a Type or css-selector, `attr` will execute a query for that element
   * and then retrieves the attribute value from it.
   *
   * Optionally accepts a converter function as third paramter, that converts the
   * found attribute value into something else. This is useful if you want to parse
   * or cast your result into another type.
   *
   * ---
   * If your html looks like that:
   * ~~~html
   * <input id="123" />
   * <label for="123">A Label</label>
   *
   * <button disabled="true">disabled</button>
   * ~~~
   * ---
   * You can ask for attributes like that:
   * ~~~ts
   * import { toBool } from '../helpers';
   *
   * expect(attr('for', 'label')).toEqual('123');
   * // the next two calls will both pass expectations:
   * expect(attr('disabled', 'button')).toEqual('true');
   * expect(attr('disabled', 'button', toBool)).toEqual(true);
   * ~~~
   * ---
   * @param name The attribute name to get the value from.
   * @param queryTarget The Type, css-selector, DebugElement or NativeElement to find or use.
   */
  attr<Html extends HTMLElement, Component>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string;
  /**
   * **Gets the specified attribute from the given query-target.**
   *
   * If the query-target is a Type or css-selector, `attr` will execute a query for that element
   * and then retrieves the attribute value from it.
   *
   * Optionally accepts a converter function as third paramter, that converts the
   * found attribute value into something else. This is useful if you want to parse
   * or cast your result into another type.
   *
   * ---
   * If your html looks like that:
   * ~~~html
   * <input id="123" />
   * <label for="123">A Label</label>
   *
   * <button disabled="true">disabled</button>
   * ~~~
   * ---
   * You can ask for attributes like that:
   * ~~~ts
   * import { toBool } from '../helpers';
   *
   * expect(attr('for', 'label')).toEqual('123');
   * // the next two calls will both pass expectations:
   * expect(attr('disabled', 'button')).toEqual('true');
   * expect(attr('disabled', 'button', toBool)).toEqual(true);
   * ~~~
   * ---
   * @param name The attribute name to get the value from.
   * @param queryTarget The Type, css-selector, DebugElement or NativeElement to find or use.
   * @param convert A conversion function parsing the attribute's value-string into something else. Often useful to parse or cast it.
   */
  attr<Html extends HTMLElement, Component, Out>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
    convert: (arg: string) => Out,
  ): Out;

  /**
   * **Gets the textContent from the specified query-target.**
   *
   * If the query-target is a Type or css-selector, `textContent` will execute a query for that element
   * and then retrieves the textContent from it. If no element matches the query, the result will be `null`.
   *
   * ---
   * If your html looks like this:
   * ~~~html
   * <div>
   *    <span class="welcome">Hello</span>
   *    <my-rotation-label>World</my-rotation-label>
   * </div>
   * ~~~
   * ---
   * You can ask for the textContent like this:
   * ~~~ts
   * const debugElement = find('div');
   * expect(textContent(debugElement)).toEqual('Hello World');
   * expect(textContent(debugElement.nativeElement)).toEqual('Hello World');
   *
   * expect(textContent('.welcome')).toEqual('Hello');
   * expect(textContent(MyRotationLabelComponent)).toEqual('World');
   * ~~~
   * ---
   * @param queryTarget A Type, css-selector, DebugElement or NativeElement to get the textContent from.
   */
  textContent<Html extends HTMLElement, Component>(
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string | null;

  /**
   * **Triggers the specified event on the given query-target.**
   *
   * If the query-target is a Type or css-selector, `textContent` will execute a query for that element
   * and then trigger the event on it. If no element matches the query it will `throw` an error like:
   *
   * - Cannot access property `triggerEventHandler` of `null`.
   *
   * ---
   * ~~~ts
   * const debugElement = find('.close-button');
   *
   * triggerEvent('click', debugElement);
   * triggerEvent('click', 'button.finish');
   * triggerEvent(TextFieldComponent, 'textChange', 'new text value!');
   * ~~~
   * ---
   *
   *  **Please Note:** Currently `NativeElement`s won't work with `triggerEvent`.
   *
   * ---
   * @param eventName The name of the event to trigger.
   * @param queryTarget A Type, css-selector or DebugElement to trigger the event on.
   * @param eventArgs (Optional) The event arguments to pass.
   */
  triggerEvent<Html extends HTMLElement, Component>(
    eventName: string,
    queryTarget: QueryTarget<Component, Html>,
    eventArgs?: any,
  ): void;
}

function asSelf(val: string) {
  return val;
}

/**
 * Converts DebugElements into NativeElements.
 *
 * ~~~ts
 * const nativeElements = findAll(ButtonComponent, toNativeElements); // => HTMLElement[]
 * ~~~
 * @param debugElements The results of a `findAll` call.
 */
export const toNativeElements = <Html extends HTMLElement, Component>(
  debugElements: TypedDebugElement<Component, Html>[],
) => debugElements.map(toNativeElement);

/**
 * Converts a DebugElement into a NativeElement.
 *
 * ~~~ts
 * const nativeElement = find(ButtonComponent, toNativeElement); // => HTMLElement;
 * ~~~
 * @param debugElement The result of a `find` call.
 */
export const toNativeElement = <Html extends HTMLElement, Component>(
  debugElement: TypedDebugElement<Component, Html>,
) => debugElement.nativeElement;

/**
 * Maps each DebugElement to the expression returned by the mapper function.
 * @param mapperFn A function that does the mapping of the DebugElements.
 */
export const mapResult = <Html extends HTMLElement, Component, Out>(
  mapperFn: (arg: TypedDebugElement<Component, Html>) => Out,
) => {
  return (debugElements: TypedDebugElement<Component, Html>[]) => debugElements.map(mapperFn);
};

export function asNumber(val: string) {
  return Number(val);
}

export function asBool(val: string) {
  return val === 'true' ? true : false;
}

export function withHelpers(suite: (helpers: TestHelpers) => void) {
  let fixture: ComponentFixture<any>;

  function debug<Component, Html extends HTMLElement>(root?: QueryTarget<Component, Html>): void {
    const rootElem = root ?? fixture.nativeElement;
    const element = isNativeElement(rootElem) ? rootElem : resolveDebugElement(rootElem);
    console.log(printHtml(element));
  }

  function detectChanges<T extends LifeCycleHooks>(component?: T): void {
    component?.ngOnInit?.();
    component?.ngOnChanges?.();

    fixture.detectChanges();
  }

  function find<Html extends HTMLElement, Component, Out>(
    query: QueryTarget<Component, Html>,
    accessor?: Fn<TypedDebugElement<Component, Html>, Out>,
  ): TypedDebugElement<Component, Html> | Out {
    if (isDebugElement(query)) {
      return accessor ? accessor(query) : query;
    }

    const value =
      typeof query === 'string'
        ? fixture.debugElement.query(By.css(query))
        : fixture.debugElement.query(By.directive(query));

    return accessor ? accessor(value) : value;
  }

  function findAll<Html extends HTMLElement, Component, Out>(
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    accessor?: Fn<TypedDebugElement<Component, Html>[], Out[]>,
  ): TypedDebugElement<Component, Html>[] | Out[] {
    const queriesAsArray = Array.isArray(queryTarget) ? queryTarget : [queryTarget];
    const results: TypedDebugElement<Component, Html>[] = [];

    for (const query of queriesAsArray) {
      const resultList = queryAll(query);
      results.push(...resultList);
    }

    return accessor ? accessor(results) : results;
  }

  function findWhere<Html extends HTMLElement, Component, Out>(
    condition: Fn<TypedDebugElement<Component, Html>, boolean>,
    queryTarget: QueryTarget<Component, Html> | QueryTarget<Component, Html>[],
    converter?: Fn<TypedDebugElement<Component, Html>, Out>,
  ): TypedDebugElement<Component, Html> | Out {
    const results: TypedDebugElement<Component, Html>[] = findAll<Html, Component, never>(
      queryTarget,
    );
    const item = results.find(condition);

    return converter ? converter(item) : item;
  }

  function attr<Html extends HTMLElement, Component>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string;
  function attr<Html extends HTMLElement, Component, Out>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
    convert: Fn<string, Out>,
  ): Out;
  function attr<Html extends HTMLElement, Component, Out>(
    name: string,
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
    converterFn?: Fn<string, Out>,
  ): string | Out {
    const nativeElement = isNativeElement(queryTarget)
      ? queryTarget
      : resolveDebugElement(queryTarget)?.nativeElement;

    if (!nativeElement) {
      return null;
    }

    const attrValue = nativeElement.getAttribute(name);
    return convert(attrValue, converterFn);
  }

  function triggerEvent<Html extends HTMLElement, Component>(
    eventName: string,
    queryTarget: QueryTarget<Component, Html>,
    eventNameArgs?: any,
  ): void {
    const debugElement = resolveDebugElement(queryTarget);
    // no safe access here, to cause an error if no element matches the query.
    debugElement.triggerEventHandler(eventName, eventNameArgs);
  }

  function textContent<Html extends HTMLElement, Component>(
    queryTarget: QueryTarget<Component, Html> | HTMLElement,
  ): string | null {
    const nativeElement = isNativeElement(queryTarget)
      ? queryTarget
      : resolveDebugElement(queryTarget)?.nativeElement;

    if (!nativeElement) {
      return null;
    }

    return nativeElement.textContent;
  }

  function resolveDebugElement<Html extends HTMLElement, Component>(
    queryTarget: QueryTarget<Component, Html>,
  ) {
    if (isDebugElement(queryTarget)) {
      return queryTarget;
    }

    return find<Html, Component, never>(queryTarget);
  }

  function convert<T, R = any>(value: T, convertTo?: Fn<T, R>): R {
    const converterFn = convertTo ?? asSelf;

    return converterFn(value as any) as R;
  }

  function queryAll<Html extends HTMLElement, Component>(query: QueryTarget<Component, Html>) {
    if (isDebugElement(query)) {
      return [query];
    }

    return typeof query === 'string'
      ? fixture.debugElement.queryAll(By.css(query))
      : fixture.debugElement.queryAll(By.directive(query));
  }

  return () =>
    suite({
      useFixture: (newFixture) => {
        fixture = newFixture;
        fixture.detectChanges();
      },
      detectChanges,
      find,
      findAll,
      findWhere,
      attr,
      triggerEvent,
      textContent,
      debug,
    });
}

// TODO: langju: maybe find better way to distinguish
function isDebugElement<Html, Component>(value: any): value is TypedDebugElement<Component, Html> {
  return (
    typeof value.queryAllNodes === 'function' && typeof value.triggerEventHandler === 'function'
  );
}

function isNativeElement(value: any): value is HTMLElement {
  // from: https://stackoverflow.com/a/384380/3063191
  return typeof HTMLElement === 'object'
    ? value instanceof HTMLElement
    : value &&
        typeof value === 'object' &&
        value !== null &&
        value.nodeType === 1 &&
        typeof value.nodeName === 'string';
}

// TODO: langju: clean up printing!
function printHtml(node: DebugElement | Node, indentation = ''): string {
  const nativeElement = isDebugElement(node) ? node.nativeElement : node;
  const elements = printNative(nativeElement, indentation);

  return elements.filter((element) => !!element).join('\n');
}

function printNative(node: Node, indentation: string): string[] {
  const children: string[] = [];

  if (node.childNodes.length > 0) {
    const printedChildren = Array.from(node.childNodes).map((child) =>
      printHtml(child, indentation + '  '),
    );

    children.push(...printedChildren.reverse());
  }

  return printNode(node, children, indentation);
}

function printNode(node: Node, children: string[], indentation: string): string[] {
  if (node.nodeName === '#text' || node.nodeName === '#comment') {
    return [];
  }

  const { tagName, elementBeginString } = beginElement(node, indentation);

  children.push(elementBeginString);
  const reversed = children.reverse();

  endElement(node, tagName, reversed, indentation);

  return reversed;
}

function beginElement(node: Node, indentation: string) {
  const tagName = hex('#569CD6')(node.nodeName.toLowerCase());
  const attributes = getAttributes(node);
  const elementBeginString = `${indentation}<${tagName}${attributes}>`;

  return { tagName, elementBeginString };
}

function endElement(node: Node, tagName: string, childrenReversed: string[], indentation: string) {
  const textChildren = Array.from(node.childNodes).filter((child) => child.nodeName === '#text');

  if (textChildren.length > 0) {
    const text = textChildren.map((child) => child.nodeValue).join(' ');
    const content = `${indentation}  ${text}`;
    childrenReversed.push(content);
  } else if (node.childNodes.length === 0) {
    if (tagName === 'input' || tagName === 'br') {
      childrenReversed[0] = childrenReversed[0].replace('>', ' />');
    } else {
      childrenReversed[0] += `</${tagName}>`;
    }

    return;
  }

  const endTag = `${indentation}</${tagName}>`;
  childrenReversed.push(endTag);
}

function getAttributes(node: Node) {
  if (!isNativeElement(node)) {
    return '';
  }

  const attributeNames = node.getAttributeNames();
  const attributes = attributeNames.map((name) => printAttribute(name, node));

  return attributes.length ? ' ' + attributes.join(' ') : '';
}

function printAttribute(name: string, node: Element): string {
  const attrName = hex('#9CDCFE')(name);
  const value = node.getAttribute(name);
  const attrValue = hex('#CE9178')(`"${value}"`);

  return `${attrName}=${attrValue}`;
}
