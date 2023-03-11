import { CollectedKycDataOption } from '@onefootprint/types';
import { StateValue } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../../../utils/missing-attributes';

const getCurrentStepFromMissingAttributes = (
  mustCollect: CollectedKycDataOption[],
  state: StateValue,
) => {
  if (!hasMissingAttributes(mustCollect)) {
    return 0;
  }
  let currentStep = 0;
  if (mustCollect.includes(CollectedKycDataOption.email)) {
    currentStep += 1;
    if (state === 'email') {
      return currentStep;
    }
  }
  if (isMissingBasicAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'basicInformation') {
      return currentStep;
    }
  }
  if (isMissingResidentialAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'residentialAddress') {
      return currentStep;
    }
  }
  if (isMissingSsnAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'ssn') {
      return currentStep;
    }
  }
  return currentStep;
};

export default getCurrentStepFromMissingAttributes;
