import { ComponentFixture } from '@angular/core/testing';
import {
  LifeCycleHooks,
  TypedDebugElement,
  TypeObjectMap,
} from '../types/index';
import { NgtxElement } from './element';

export class NgtxFixture {
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
    T extends Partial<LifeCycleHooks>,
    Html extends Element = Element,
  >(component?: T, changes?: TypeObjectMap<T>): NgtxElement<Html, T> {
    component?.ngOnChanges?.(changes);
    component?.ngOnInit?.();

    this.fixture.detectChanges();

    // hint: we trust the user to pass in the correct component type here:
    return this as unknown as NgtxElement<Html, T>;
  }
}
