import {
  BusinessData,
  CollectedKybDataOption,
  CollectedKybDataOptionToRequiredAttributes,
} from '@onefootprint/types';

/*
  TODO:
  - add unit tests for these utils
  - add utils for doing-business-as, website, phone number
*/

const BASIC_DATA_ATTRIBUTES = [
  CollectedKybDataOption.name,
  CollectedKybDataOption.ein,
  CollectedKybDataOption.phoneNumber,
  CollectedKybDataOption.website,
];

const BUSINESS_ADDRESS_ATTRIBUTES = [CollectedKybDataOption.address];

const BENEFICIAL_OWNER_ATTRIBUTES = [CollectedKybDataOption.beneficialOwners];

const isMissing = (
  attributes: CollectedKybDataOption[],
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => CollectedKybDataOptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingBasicDataAttribute = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessData,
) => isMissing(BASIC_DATA_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBusinessAddressAttribute = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessData,
) => isMissing(BUSINESS_ADDRESS_ATTRIBUTES, mustCollect, collectedData);

export const isMissingBeneficialOwnerAttribute = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessData,
) => isMissing(BENEFICIAL_OWNER_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: CollectedKybDataOption[],
  collectedData?: BusinessData,
) =>
  mustCollect.some(option =>
    CollectedKybDataOptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );
