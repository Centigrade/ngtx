import { NgtxScenarioTestingExtensionFn } from './types';

export function withChangeDetectionAfterSetup(): NgtxScenarioTestingExtensionFn {
  return ({ fixtureRef }) => fixtureRef().detectChanges();
}
