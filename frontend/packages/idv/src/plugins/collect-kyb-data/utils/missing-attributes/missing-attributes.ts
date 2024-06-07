import type { BusinessDIData } from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';

const BASIC_DATA_ATTRIBUTES = [
  CollectedKybDataOption.name,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.phoneNumber,
  CollectedKybDataOption.website,
];

const BUSINESS_ADDRESS_ATTRIBUTES = [CollectedKybDataOption.address];

const BENEFICIAL_OWNER_ATTRIBUTES = [
  CollectedKybDataOption.beneficialOwners,
  CollectedKybDataOption.kycedBeneficialOwners,
];

const isMissing = (
  attributes: CollectedKybDataOption[],
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessDIData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => CollectedKybDataOptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingBasicDataAttribute = (mustCollect: CollectedKybDataOption[], collectedData?: BusinessDIData) =>
  isMissing(BASIC_DATA_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBusinessAddressAttribute = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessDIData,
) => isMissing(BUSINESS_ADDRESS_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBeneficialOwnerAttribute = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessDIData,
) => isMissing(BENEFICIAL_OWNER_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (mustCollect: CollectedKybDataOption[], collectedData?: BusinessDIData) =>
  mustCollect.some(option =>
    CollectedKybDataOptionToRequiredAttributes[option].some(attr => !collectedData || !collectedData[attr]),
  );
