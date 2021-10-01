import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Fn, LifeCycleHooks, QueryTarget, TypedDebugElement } from '.';
import { TypeObjectMap } from './typed-object-map';

export interface Ngtx {
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
  debug<Component, Html extends HTMLElement>(
    root?: QueryTarget<Component, Html>,
  ): void;
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
  detectChanges<T extends LifeCycleHooks>(
    component: T,
    changes?: TypeObjectMap<T>,
  ): void;

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
  find<Html extends HTMLElement, Component = any>(
    cssSelector: string,
  ): TypedDebugElement<Component, Html>;
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
   * @param cssSelector A css-selector describing your wanted element.
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
  findAll<Html extends HTMLElement>(
    cssSelector: string,
  ): TypedDebugElement<any, Html>[];
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
   * Optionally accepts a converter function as third parameter, that converts the
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
   * Optionally accepts a converter function as third parameter, that converts the
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
