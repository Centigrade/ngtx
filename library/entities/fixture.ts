import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { NgtxMultiElement } from '.';
import { LifeCycleHooks, QueryTarget, TypeObjectMap } from '../types/index';
import { NgtxElement } from './element';

export class NgtxFixture {
  private root: NgtxElement;

  constructor(private fixture?: ComponentFixture<any>) {
    this.root = new NgtxElement(fixture?.debugElement);
  }

  /**
   * **Provides the test helpers with the correct `fixture` instance on which they work.**
   *
   * Call this function in the `beforeEach`-hook in which the fixture is created.
   *
   * ---
   * Use it like that:
   *
   * ~~~ts
   * describe('MyTests', ngtx({ useFixture, ... }) => {
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
  public useFixture<Html extends Element, T>(
    fixture: ComponentFixture<T>,
    skipInitialChangeDetection = false,
  ): void {
    this.fixture = fixture;
    this.root = new NgtxElement<Html, T>(this.fixture.debugElement);

    if (!skipInitialChangeDetection) {
      fixture.detectChanges();
    }
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
  public detectChanges<Html extends Element = Element, Component = any>(): void;
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
    T extends Partial<LifeCycleHooks>,
    Html extends Element = Element,
  >(component: T, changes?: TypeObjectMap<T>): void;
  public detectChanges<T extends Partial<LifeCycleHooks>>(
    component?: T,
    changes?: TypeObjectMap<T>,
  ): void {
    component?.ngOnChanges?.(changes);
    component?.ngOnInit?.();

    this.fixture.detectChanges();
  }

  public get<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxElement<Html, Component>;
  public get<Html extends Element, Component>(
    component: Type<Component>,
  ): NgtxElement<Html, Component>;
  public get<Html extends Element, Component>(
    query: QueryTarget<Component>,
  ): NgtxElement<Html, Component> {
    return this.root.get(query as any);
  }

  public getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: Type<Component>,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Component>,
  ): NgtxMultiElement<Html, Component> {
    return this.root.getAll(queryTarget);
  }

  public triggerEvent(name: string, eventArgs?: any): void {
    return this.root.triggerEvent(name, eventArgs);
  }
}
