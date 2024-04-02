import type { OnboardingRequirement } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';

/**
 * Given the last top priority requirement and current top priority requirement, returns if the
 * user is stuck on a repeat requirement.
 */
const isRepeatRequirement = (
  a?: OnboardingRequirement,
  b?: OnboardingRequirement,
) => {
  if (!a || !b) {
    return false;
  }

  if (
    a.kind === OnboardingRequirementKind.idDoc &&
    b.kind === OnboardingRequirementKind.idDoc
  ) {
    return a.documentRequestKind === b.documentRequestKind;
  }

  return a.kind === b.kind;
};

export default isRepeatRequirement;
