import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { asSelf } from './converter';
import { isDebugElement, isNativeElement } from './type-guards';
import { Fn, LifeCycleHooks, QueryTarget, TypedDebugElement } from './types';
import { Ngtx } from './types/ngtx';
import { printHtml, resolveDebugElement } from './utility';

export function ngtx(suite: (features: Ngtx) => void) {
  let fixture: ComponentFixture<any>;

  function debug<Component, Html extends HTMLElement>(
    root?: QueryTarget<Component, Html>,
  ): void {
    const rootElem = root ?? fixture.nativeElement;
    const element = isNativeElement(rootElem)
      ? rootElem
      : resolveDebugElement(rootElem);
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
    const queriesAsArray = Array.isArray(queryTarget)
      ? queryTarget
      : [queryTarget];
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
    const results: TypedDebugElement<Component, Html>[] = findAll<
      Html,
      Component,
      never
    >(queryTarget);
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

  function convert<T, R = any>(value: T, convertTo?: Fn<T, R>): R {
    const converterFn = convertTo ?? asSelf;

    return converterFn(value as any) as R;
  }

  function queryAll<Html extends HTMLElement, Component>(
    query: QueryTarget<Component, Html>,
  ) {
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
