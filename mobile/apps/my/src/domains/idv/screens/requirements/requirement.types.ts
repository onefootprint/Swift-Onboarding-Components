import type { IdDocRequirement, LivenessRequirement } from '@onefootprint/types';

export type RemainingRequirements = {
  liveness: LivenessRequirement | null;
  idDoc: IdDocRequirement | null;
};
