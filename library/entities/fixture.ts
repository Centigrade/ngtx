import { Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { NgtxMultiElement } from '.';
import { LifeCycleHooks, QueryTarget, TypeObjectMap } from '../types/index';
import { NgtxElement } from './element';

export class NgtxFixture<HostHtml extends Element, HostComponent> {
  private root: NgtxElement<HostHtml, HostComponent>;

  public get rootElement() {
    return this.root;
  }

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
  public useFixture<Html extends Element, Component>(
    fixture: ComponentFixture<Component>,
    skipInitialChangeDetection = false,
  ): NgtxFixture<Html, Component> {
    this.fixture = fixture;

    this.root = new NgtxElement<Html, Component>(
      this.fixture.debugElement,
    ) as any;

    if (!skipInitialChangeDetection) {
      fixture.detectChanges();
    }

    return this as unknown as NgtxFixture<Html, Component>;
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
    changes: TypeObjectMap<T> = {},
  ): void {
    this.checkFixture();

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
    queries: QueryTarget<Component>[],
  ): NgtxElement<Html, Component>;
  public get<Html extends Element, Component>(
    query: QueryTarget<Component> | QueryTarget<Component>[],
  ): NgtxElement<Html, Component> {
    this.checkFixture();

    return this.root.get(query as any);
  }

  public getAll<Html extends Element, Component = any>(
    cssSelector: string,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: Type<Component>,
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Component>[],
  ): NgtxMultiElement<Html, Component>;
  public getAll<Html extends Element, Component>(
    queryTarget: QueryTarget<Component> | QueryTarget<Component>[],
  ): NgtxMultiElement<Html, Component> {
    this.checkFixture();

    return this.root.getAll(queryTarget as any);
  }

  public triggerEvent(name: string, eventArgs?: any): void {
    this.checkFixture();

    return this.root.triggerEvent(name, eventArgs);
  }

  private checkFixture() {
    if (this.fixture == null) {
      throw new Error(
        '[ngtx] No fixture was passed via "useFixture" helper, or the test-fixture failed to build.',
      );
    }
  }
}
