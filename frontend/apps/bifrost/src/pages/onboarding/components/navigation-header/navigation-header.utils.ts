import { States } from 'src/utils/state-machine/onboarding/types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { CollectedDataOption } from 'types';

const getCurrentStepFromMissingAttributes = (
  mustCollect: readonly CollectedDataOption[],
  state: States,
) => {
  if (!hasMissingAttributes(mustCollect)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingBasicAttribute(mustCollect)) {
    currentStep += 1;
    if (state === States.basicInformation) {
      return currentStep;
    }
  }
  if (isMissingResidentialAttribute(mustCollect)) {
    currentStep += 1;
    if (state === States.residentialAddress) {
      return currentStep;
    }
  }
  if (isMissingSsnAttribute(mustCollect)) {
    currentStep += 1;
    if (state === States.ssn) {
      return currentStep;
    }
  }
  return currentStep;
};

export default getCurrentStepFromMissingAttributes;
