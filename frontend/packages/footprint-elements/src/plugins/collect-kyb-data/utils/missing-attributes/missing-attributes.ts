import { BusinessDataAttribute } from '@onefootprint/types';
import { StateValue } from 'xstate';

import { BusinessData } from '../state-machine/types';

/*
  TODO:
  - consolidate these placeholder types with backend
  - add unit tests for these utils
*/

const BASIC_DATA_ATTRIBUTES = [
  BusinessDataAttribute.name,
  BusinessDataAttribute.ein,
];

const BUSINESS_ADDRESS_ATTRIBUTES = [
  BusinessDataAttribute.addressLine1,
  BusinessDataAttribute.city,
  BusinessDataAttribute.state,
  BusinessDataAttribute.country,
  BusinessDataAttribute.zip,
];

const BENEFICIAL_OWNER_ATTRIBUTES = [BusinessDataAttribute.beneficialOwners];

export const isMissing = (
  attributes: BusinessDataAttribute[],
  mustCollect: BusinessDataAttribute[],
  collectedData?: BusinessData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingBasicDataAttribute = (
  mustCollect: BusinessDataAttribute[],
  collectedData?: BusinessData,
) => isMissing(BASIC_DATA_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBusinessAddressAttribute = (
  mustCollect: BusinessDataAttribute[],
  collectedData?: BusinessData,
) => isMissing(BUSINESS_ADDRESS_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBeneficialOwnerAttribute = (
  mustCollect: BusinessDataAttribute[],
  collectedData?: BusinessData,
) => isMissing(BENEFICIAL_OWNER_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: BusinessDataAttribute[],
  collectedData?: BusinessData,
) => mustCollect.some(option => !collectedData || !collectedData[option]);

export const getCurrentStepFromMissingAttributes = (
  attributes: BusinessDataAttribute[],
  state: StateValue,
) => {
  if (!hasMissingAttributes(attributes)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingBasicDataAttribute(attributes)) {
    currentStep += 1;
    if (state === 'basicInformation') {
      return currentStep;
    }
  }
  if (isMissingBusinessAddressAttribute(attributes)) {
    currentStep += 1;
    if (state === 'residentialAddress') {
      return currentStep;
    }
  }
  if (isMissingBeneficialOwnerAttribute(attributes)) {
    currentStep += 1;
    if (state === 'ssn') {
      return currentStep;
    }
  }
  return currentStep;
};
