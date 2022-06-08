import { States } from 'src/utils/state-machine/onboarding/types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { UserDataAttribute } from 'src/utils/state-machine/types';

export const getMaxStepFromMissingAttributes = (
  attributes: readonly UserDataAttribute[],
) => {
  if (!hasMissingAttributes(attributes)) {
    return 0;
  }
  let maxStep = 0;
  if (isMissingBasicAttribute(attributes)) {
    maxStep += 1;
  }
  if (isMissingResidentialAttribute(attributes)) {
    maxStep += 1;
  }
  if (isMissingSsnAttribute(attributes)) {
    maxStep += 1;
  }
  return maxStep;
};

export const getCurrentStepFromMissingAttributes = (
  attributes: readonly UserDataAttribute[],
  state: States,
) => {
  if (!hasMissingAttributes(attributes)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingBasicAttribute(attributes)) {
    currentStep += 1;
    if (state === States.basicInformation) {
      return currentStep;
    }
  }
  if (isMissingResidentialAttribute(attributes)) {
    currentStep += 1;
    if (state === States.residentialAddress) {
      return currentStep;
    }
  }
  if (isMissingSsnAttribute(attributes)) {
    currentStep += 1;
    if (state === States.ssn) {
      return currentStep;
    }
  }
  return currentStep;
};
