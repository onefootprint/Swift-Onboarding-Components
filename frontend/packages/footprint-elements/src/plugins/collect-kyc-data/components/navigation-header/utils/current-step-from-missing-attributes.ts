import { CollectedKycDataOption } from '@onefootprint/types';

import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../../../utils/missing-attributes';
import { States } from '../../../utils/state-machine/types';

const getCurrentStepFromMissingAttributes = (
  mustCollect: readonly CollectedKycDataOption[],
  state: States,
) => {
  if (!hasMissingAttributes(mustCollect)) {
    return 0;
  }
  let currentStep = 0;
  if (mustCollect.includes(CollectedKycDataOption.email)) {
    currentStep += 1;
    if (state === States.email) {
      return currentStep;
    }
  }
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
