import {
  OnboardingRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { RemainingRequirements } from '../../../../requirement.types';

const getRemainingRequirements = (requirements: OnboardingRequirement[]) => {
  const remainingRequirements: RemainingRequirements = {
    liveness: null,
    idDoc: null,
  };
  requirements.forEach(req => {
    if (req.kind === OnboardingRequirementKind.liveness) {
      remainingRequirements.liveness = req;
    } else if (req.kind === OnboardingRequirementKind.idDoc) {
      remainingRequirements.idDoc = req;
    }
  });
  return remainingRequirements;
};

export default getRemainingRequirements;
