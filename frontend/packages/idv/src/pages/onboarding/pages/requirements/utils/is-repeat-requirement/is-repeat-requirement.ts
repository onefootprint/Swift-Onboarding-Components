import type { OnboardingRequirement } from '@onefootprint/types';
import { DocumentRequestKind, OnboardingRequirementKind } from '@onefootprint/types';

/**
 * Given the last top priority requirement and current top priority requirement, returns if the
 * user is stuck on a repeat requirement.
 */
const isRepeatRequirement = (a?: OnboardingRequirement, b?: OnboardingRequirement) => {
  if (!a || !b) {
    return false;
  }

  if (a.kind === OnboardingRequirementKind.idDoc && b.kind === OnboardingRequirementKind.idDoc) {
    if (a.config.kind === DocumentRequestKind.Custom && b.config.kind === DocumentRequestKind.Custom) {
      return a.config.name === b.config.name;
    }
    return a.config.kind === b.config.kind;
  }

  return a.kind === b.kind;
};

export default isRepeatRequirement;
