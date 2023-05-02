import {
  CollectedKycDataOption,
  CollectedKycDataOptionToRequiredAttributes,
  IdDI,
  IdDIData,
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
  attributes: CollectedKycDataOption[],
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => CollectedKycDataOptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingEmailAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) =>
  mustCollect.includes(CollectedKycDataOption.email) &&
  !collectedData?.[IdDI.email];

export const isMissingBasicAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) => isMissing(BASIC_ATTRIBUTES, mustCollect, collectedData);

export const isMissingResidentialAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) => isMissing(RESIDENTIAL_ATTRIBUTES, mustCollect, collectedData);

export const isMissingSsnAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) => isMissing(SSN_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: IdDIData,
) =>
  mustCollect.some(option =>
    CollectedKycDataOptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );
