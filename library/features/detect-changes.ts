import { ComponentFixture } from '@angular/core/testing';
import { LifeCycleHooks } from '../types';
import { TypeObjectMap } from '../types/typed-object-map';

export function detectChangesImpl<T extends LifeCycleHooks>(
  fixture: ComponentFixture<any>,
  component?: T,
  changes?: TypeObjectMap<T>,
): void {
  component?.ngOnChanges?.(changes);
  component?.ngOnInit?.();

  fixture.detectChanges();
}
