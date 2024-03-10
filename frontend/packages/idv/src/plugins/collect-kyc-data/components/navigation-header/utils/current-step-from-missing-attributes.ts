import type { CollectKycDataRequirement } from '@onefootprint/types';
import type { StateValue } from 'xstate';

import type { KycData } from '../../../utils/data-types';
import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
  isMissingUsLegalStatusAttribute,
} from '../../../utils/missing-attributes';

const getCurrentStepFromMissingAttributes = (
  requirement: CollectKycDataRequirement,
  initData: KycData,
  state: StateValue,
) => {
  const attributesToCollect = [
    ...requirement.missingAttributes,
    ...requirement.optionalAttributes,
  ];
  // Use init data below to figure out which pages we visited previously
  if (!hasMissingAttributes(attributesToCollect, initData)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingBasicAttribute(attributesToCollect, initData)) {
    currentStep += 1;
    if (state === 'basicInformation') {
      return currentStep;
    }
  }
  if (isMissingResidentialAttribute(attributesToCollect, initData)) {
    currentStep += 1;
    if (state === 'residentialAddress') {
      return currentStep;
    }
  }
  if (isMissingUsLegalStatusAttribute(attributesToCollect, initData)) {
    currentStep += 1;
    if (state === 'usLegalAddress') {
      return currentStep;
    }
  }
  if (isMissingSsnAttribute(attributesToCollect, initData)) {
    currentStep += 1;
    if (state === 'ssn') {
      return currentStep;
    }
  }
  return currentStep;
};

export default getCurrentStepFromMissingAttributes;
