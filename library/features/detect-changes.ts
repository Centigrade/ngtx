import { ComponentFixture } from '@angular/core/testing';
import { LifeCycleHooks } from '../types';

export function detectChangesImpl<T extends LifeCycleHooks>(
  fixture: ComponentFixture<any>,
  component?: T,
): void {
  component?.ngOnInit?.();
  component?.ngOnChanges?.();

  fixture.detectChanges();
}
