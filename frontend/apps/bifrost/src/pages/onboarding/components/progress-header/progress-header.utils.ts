import { States } from 'src/utils/state-machine/onboarding/types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { CollectedDataOption } from 'src/utils/state-machine/types';

export const getMaxStepFromMissingAttributes = (
  mustCollect: readonly CollectedDataOption[],
) => {
  if (!hasMissingAttributes(mustCollect)) {
    return 0;
  }
  let maxStep = 0;
  if (isMissingBasicAttribute(mustCollect)) {
    maxStep += 1;
  }
  if (isMissingResidentialAttribute(mustCollect)) {
    maxStep += 1;
  }
  if (isMissingSsnAttribute(mustCollect)) {
    maxStep += 1;
  }
  return maxStep;
};

export const getCurrentStepFromMissingAttributes = (
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
