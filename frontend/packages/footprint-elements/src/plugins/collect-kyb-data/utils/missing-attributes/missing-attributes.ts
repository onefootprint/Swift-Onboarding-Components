import {
  BusinessData,
  BusinessDataAttribute,
  CollectedKybDataOption,
} from '@onefootprint/types';

/*
  TODO:
  - add unit tests for these utils
  - add utils for doing-business-as, website, phone number
*/

const BASIC_DATA_ATTRIBUTES = [
  CollectedKybDataOption.name,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.phoneNumber,
  CollectedKybDataOption.website,
];

const BUSINESS_ADDRESS_ATTRIBUTES = [CollectedKybDataOption.address];

const BENEFICIAL_OWNER_ATTRIBUTES = [CollectedKybDataOption.beneficialOwners];

export const CollectedKybDataOptionToRequiredAttributes: Record<
  CollectedKybDataOption,
  BusinessDataAttribute[]
> = {
  [CollectedKybDataOption.name]: [BusinessDataAttribute.name],
  [CollectedKybDataOption.tin]: [BusinessDataAttribute.tin],
  [CollectedKybDataOption.address]: [
    BusinessDataAttribute.addressLine1,
    BusinessDataAttribute.city,
    BusinessDataAttribute.state,
    BusinessDataAttribute.zip,
    BusinessDataAttribute.country,
  ],
  [CollectedKybDataOption.phoneNumber]: [BusinessDataAttribute.phoneNumber],
  [CollectedKybDataOption.website]: [BusinessDataAttribute.website],
  [CollectedKybDataOption.corporationType]: [
    BusinessDataAttribute.corporationType,
  ],
  [CollectedKybDataOption.beneficialOwners]: [
    BusinessDataAttribute.beneficialOwners,
  ],
  [CollectedKybDataOption.kycedBeneficialOwners]: [
    BusinessDataAttribute.kycedBeneficialOwners,
  ],
};

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
