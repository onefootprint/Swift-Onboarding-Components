import {
  CollectedKycDataOption,
  CollectedKycDataOptionToRequiredAttributes,
} from '@onefootprint/types';

import { KycData } from '../data-types';

// The list of CollectedKycDataOption that may be input on the basic info screen
const BASIC_ATTRIBUTES = [
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.nationality,
];

// The list of CollectedKycDataOption that may be input on the basic info screen
const US_LEGAL_STATUS_ATTRIBUTES = [CollectedKycDataOption.usLegalStatus];

// The list of CollectedKycDataOption that may be input on the residential screen
const RESIDENTIAL_ATTRIBUTES = [CollectedKycDataOption.address];

// The list of CollectedKycDataOption that may be input on the ssn screen
const SSN_ATTRIBUTES = [
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.ssn4,
];

// An attribute is missing if
// (1) it wasn't a disabled/bootstrapped/decrypted value
// (2) it hasn't yet been collected
export const isMissing = (
  options: CollectedKycDataOption[],
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => {
  const attributes = options
    .filter(option => mustCollect.includes(option))
    .flatMap(option => CollectedKycDataOptionToRequiredAttributes[option]);

  // No attributes to collect
  if (!attributes.length) {
    return false;
  }
  // No data collected so far
  if (!collectedData || Object.keys(collectedData).length === 0) {
    return true;
  }

  // Filter out entries with disabled/bootstrapped/decrypted values
  const filteredAttributes = attributes.filter(attr => {
    const entry = collectedData[attr];
    return (
      !entry?.bootstrap &&
      !entry?.disabled &&
      !entry?.decrypted &&
      !entry?.scrubbed
    );
  });

  // Completely missing entries
  const isMissingEntries = filteredAttributes.some(
    attr => !collectedData[attr] || !collectedData[attr]?.value,
  );

  return isMissingEntries;
};

export const isMissingEmailAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => isMissing([CollectedKycDataOption.email], mustCollect, collectedData);

export const isMissingBasicAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => isMissing(BASIC_ATTRIBUTES, mustCollect, collectedData);

export const isMissingUsLegalStatusAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => isMissing(US_LEGAL_STATUS_ATTRIBUTES, mustCollect, collectedData);

export const isMissingResidentialAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => isMissing(RESIDENTIAL_ATTRIBUTES, mustCollect, collectedData);

export const isMissingSsnAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) => isMissing(SSN_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) =>
  mustCollect.some(option =>
    CollectedKycDataOptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );

export const shouldConfirm = (collectedData?: KycData) => {
  // Show confirm if any data is collected at all
  if (!collectedData || Object.keys(collectedData).length === 0) {
    return false;
  }
  const hasData = Object.values(collectedData).some(data => data.value);
  return hasData;
};
