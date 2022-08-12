import { UserData, UserDataAttribute } from '../../types';
import { States } from '../types';

const BASIC_ATTRIBUTES = new Set([
  UserDataAttribute.firstName,
  UserDataAttribute.lastName,
  UserDataAttribute.dob,
]);

const RESIDENTIAL_ATTRIBUTES = new Set([
  UserDataAttribute.streetAddress,
  UserDataAttribute.streetAddress2,
  UserDataAttribute.city,
  UserDataAttribute.state,
  UserDataAttribute.country,
  UserDataAttribute.zip,
]);

export const isMissingBasicAttribute = (
  missingAttributes: readonly UserDataAttribute[],
  data?: UserData,
) => {
  if (!missingAttributes.length) {
    return false;
  }
  if (!data) {
    return missingAttributes.some((attribute: UserDataAttribute) =>
      BASIC_ATTRIBUTES.has(attribute),
    );
  }
  // Find out if there are any missing basic info attributes that haven't been filled in data yet
  return missingAttributes.some(
    (attribute: UserDataAttribute) =>
      BASIC_ATTRIBUTES.has(attribute) && !data[attribute],
  );
};

export const isMissingResidentialAttribute = (
  missingAttributes: readonly UserDataAttribute[],
  data?: UserData,
) => {
  if (!missingAttributes.length) {
    return false;
  }
  if (!data) {
    return missingAttributes.some((attribute: UserDataAttribute) =>
      RESIDENTIAL_ATTRIBUTES.has(attribute),
    );
  }
  // Find out if there are any missing residential info attributes that haven't been filled in data yet
  return missingAttributes.some(
    (attribute: UserDataAttribute) =>
      RESIDENTIAL_ATTRIBUTES.has(attribute) && !data[attribute],
  );
};

export const isMissingSsnAttribute = (
  missingAttributes: readonly UserDataAttribute[],
  data?: UserData,
) => {
  if (!missingAttributes.length) {
    return false;
  }
  const missingFullSsn = missingAttributes.indexOf(UserDataAttribute.ssn) > -1;
  const missingLast4Ssn =
    missingAttributes.indexOf(UserDataAttribute.lastFourSsn) > -1;

  if (!missingFullSsn && !missingLast4Ssn) {
    return false;
  }

  if (!data) {
    return true;
  }

  if (missingFullSsn && !data[UserDataAttribute.ssn]) {
    return true;
  }
  if (missingLast4Ssn && !data[UserDataAttribute.lastFourSsn]) {
    return true;
  }
  return false;
};

export const hasMissingAttributes = (
  missingAttributes: readonly UserDataAttribute[],
  data?: UserData,
) => {
  if (!missingAttributes.length) {
    return false;
  }
  if (!data) {
    return true;
  }
  return missingAttributes.some(
    (attribute: UserDataAttribute) => !data[attribute],
  );
};

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
