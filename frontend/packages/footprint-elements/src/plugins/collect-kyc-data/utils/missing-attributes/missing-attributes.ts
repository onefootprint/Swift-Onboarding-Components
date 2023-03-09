import {
  CollectedKycDataOption,
  OptionToRequiredAttributes,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';

// The list of CollectedKycDataOption that may be input on the basic info screen
const BASIC_ATTRIBUTES = [
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
];

// The list of CollectedKycDataOption that may be input on the residential screen
const RESIDENTIAL_ATTRIBUTES = [
  CollectedKycDataOption.fullAddress,
  CollectedKycDataOption.partialAddress,
];

// The list of CollectedKycDataOption that may be input on the ssn screen
const SSN_ATTRIBUTES = [
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
];

// An attribute is missing if
// (1) it must be collected for this onboarding session AND
// (2) it hasn't yet been collected
export const isMissing = (
  attributes: readonly CollectedKycDataOption[],
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => OptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingEmailAttribute = (
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  mustCollect.includes(CollectedKycDataOption.email) &&
  !collectedData?.[UserDataAttribute.email];

export const isMissingBasicAttribute = (
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(BASIC_ATTRIBUTES, mustCollect, collectedData);

export const isMissingResidentialAttribute = (
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(RESIDENTIAL_ATTRIBUTES, mustCollect, collectedData);

export const isMissingSsnAttribute = (
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(SSN_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: readonly CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  mustCollect.some(option =>
    OptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );
