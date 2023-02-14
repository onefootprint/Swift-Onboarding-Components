import {
  OnboardingRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import { Requirements } from './state-machine';

const convertRequirements = (input: OnboardingRequirement[]): Requirements => {
  let missingLiveness = false;
  let missingIdDoc = false;
  let missingSelfie = false;
  let missingConsent = false;

  input.forEach((req: OnboardingRequirement) => {
    if (req.kind === OnboardingRequirementKind.liveness) {
      missingLiveness = true;
    }
    if (req.kind === OnboardingRequirementKind.idDoc) {
      missingIdDoc = true;
      missingSelfie = req.shouldCollectSelfie;
      missingConsent = req.shouldCollectConsent;
    }
  });
  return {
    missingIdDoc,
    missingSelfie,
    missingLiveness,
    missingConsent,
  };
};

export default convertRequirements;
