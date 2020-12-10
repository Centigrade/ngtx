import { SimpleChanges } from '@angular/core';

export interface LifeCycleHooks {
  ngOnInit?: () => void;
  ngOnChanges?: (changes?: SimpleChanges) => void;
}
