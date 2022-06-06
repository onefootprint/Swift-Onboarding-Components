import { UserData, UserDataAttribute } from '../../types';

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
    return true;
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
    return true;
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
  if (!data || missingAttributes.indexOf(UserDataAttribute.ssn) === -1) {
    return true;
  }
  return !data[UserDataAttribute.ssn];
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
