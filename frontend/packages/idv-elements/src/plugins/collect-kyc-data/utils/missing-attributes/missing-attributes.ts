import type { CollectKycDataRequirement } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  CollectedKycDataOptionToRequiredAttributes,
  IdDI,
  UsLegalStatus,
} from '@onefootprint/types';
import { pickBy } from 'lodash';

import type { KycData } from '../data-types';

// The list of CollectedKycDataOption that may be input on the basic info screen
const BASIC_ATTRIBUTES = [
  CollectedKycDataOption.name,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.nationality,
];

// The list of CollectedKycDataOption that may be input on the us legal status screen
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

  // Adjust required attributes depending on us legal status
  if (
    options === US_LEGAL_STATUS_ATTRIBUTES &&
    IdDI.usLegalStatus in collectedData
  ) {
    const usLegalStatus = collectedData[IdDI.usLegalStatus]?.value;
    if (
      usLegalStatus === UsLegalStatus.permanentResident ||
      usLegalStatus === UsLegalStatus.visa
    ) {
      attributes.push(IdDI.nationality, IdDI.citizenships);
    }
    if (usLegalStatus === UsLegalStatus.visa) {
      attributes.push(IdDI.visaKind, IdDI.visaExpirationDate);
    }
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

export const shouldConfirm = (
  collectedData: KycData,
  requirement: CollectKycDataRequirement,
) => {
  // Show confirm if any data is collected at all
  if (!collectedData || Object.keys(collectedData).length === 0) {
    return false;
  }

  const missingAttributesSet = new Set(requirement.missingAttributes);
  const needsToVaultEmail = missingAttributesSet.has(
    CollectedKycDataOption.email,
  );
  const needsToVaultPhone = missingAttributesSet.has(
    CollectedKycDataOption.phoneNumber,
  );

  // We only send email/phone if it just got collected and we need to send to backend
  // If that's not the case, filter out email/phone fields since we don't show them in the confirm page
  const dataToConfirm = pickBy(collectedData, (value, key) => {
    if (!needsToVaultEmail && key === IdDI.email) {
      return false;
    }
    if (!needsToVaultPhone && key === IdDI.phoneNumber) {
      return false;
    }
    return !!value.value;
  });

  return Object.keys(dataToConfirm).length > 0;
};
