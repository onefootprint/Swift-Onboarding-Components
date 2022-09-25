import {
  CollectedDataOption,
  OptionToRequiredAttributes,
  UserData,
} from '@onefootprint/types';

import { States } from '../types';

// The list of CollectedDataOptions that may be input on the basic info screen
const BASIC_ATTRIBUTES = [CollectedDataOption.name, CollectedDataOption.dob];

// The list of CollectedDataOptions that may be input on the residential screen
const RESIDENTIAL_ATTRIBUTES = [
  CollectedDataOption.fullAddress,
  CollectedDataOption.partialAddress,
];

// The list of CollectedDataOptions that may be input on the ssn screen
const SSN_ATTRIBUTES = [CollectedDataOption.ssn9, CollectedDataOption.ssn4];

// An attribute is missing if
// (1) it must be collected for this onboarding session AND
// (2) it hasn't yet been collected
export const isMissing = (
  attributes: readonly CollectedDataOption[],
  mustCollect: readonly CollectedDataOption[],
  collectedData?: UserData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => OptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingBasicAttribute = (
  mustCollect: readonly CollectedDataOption[],
  collectedData?: UserData,
) => isMissing(BASIC_ATTRIBUTES, mustCollect, collectedData);

export const isMissingResidentialAttribute = (
  mustCollect: readonly CollectedDataOption[],
  collectedData?: UserData,
) => isMissing(RESIDENTIAL_ATTRIBUTES, mustCollect, collectedData);

export const isMissingSsnAttribute = (
  mustCollect: readonly CollectedDataOption[],
  collectedData?: UserData,
) => isMissing(SSN_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: readonly CollectedDataOption[],
  collectedData?: UserData,
) =>
  mustCollect.some(option =>
    OptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );

export const getMaxStepFromMissingAttributes = (
  attributes: readonly CollectedDataOption[],
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
  attributes: readonly CollectedDataOption[],
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
