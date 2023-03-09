import { BusinessData, BusinessDataAttribute } from '@onefootprint/types';

/*
  TODO:
  - consolidate these placeholder types with backend
  - add unit tests for these utils
  - add utils for doing-business-as, website, phone number
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
