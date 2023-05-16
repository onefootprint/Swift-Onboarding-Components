import { CollectKycDataRequirement } from '@onefootprint/types';
import { StateValue } from 'xstate';

import { KycData } from '../../../utils/data-types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingEmailAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../../../utils/missing-attributes';

const getCurrentStepFromMissingAttributes = (
  requirement: CollectKycDataRequirement,
  initData: KycData,
  state: StateValue,
) => {
  const { missingAttributes } = requirement;
  // Use init data below to figure out which pages we visited previously
  if (!hasMissingAttributes(missingAttributes, initData)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingEmailAttribute(missingAttributes, initData)) {
    currentStep += 1;
    if (state === 'email') {
      return currentStep;
    }
  }
  if (isMissingBasicAttribute(missingAttributes, initData)) {
    currentStep += 1;
    if (state === 'basicInformation') {
      return currentStep;
    }
  }
  if (isMissingResidentialAttribute(missingAttributes, initData)) {
    currentStep += 1;
    if (state === 'residentialAddress') {
      return currentStep;
    }
  }
  if (isMissingSsnAttribute(missingAttributes, initData)) {
    currentStep += 1;
    if (state === 'ssn') {
      return currentStep;
    }
  }
  return currentStep;
};

export default getCurrentStepFromMissingAttributes;
