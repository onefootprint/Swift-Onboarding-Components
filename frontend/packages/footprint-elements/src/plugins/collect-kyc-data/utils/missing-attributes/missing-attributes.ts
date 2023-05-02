import {
  CollectedKycDataOption,
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

const CollectedKycDataOptionToRequiredAttributes: Record<
  CollectedKycDataOption,
  UserDataAttribute[]
> = {
  [CollectedKycDataOption.name]: [
    UserDataAttribute.firstName,
    UserDataAttribute.lastName,
  ],
  [CollectedKycDataOption.dob]: [UserDataAttribute.dob],
  [CollectedKycDataOption.ssn4]: [UserDataAttribute.ssn4],
  [CollectedKycDataOption.ssn9]: [UserDataAttribute.ssn9],
  [CollectedKycDataOption.fullAddress]: [
    UserDataAttribute.addressLine1,
    UserDataAttribute.city,
    UserDataAttribute.state,
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.partialAddress]: [
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.email]: [UserDataAttribute.email],
  [CollectedKycDataOption.phoneNumber]: [UserDataAttribute.phoneNumber],
};

// An attribute is missing if
// (1) it must be collected for this onboarding session AND
// (2) it hasn't yet been collected
export const isMissing = (
  attributes: CollectedKycDataOption[],
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  attributes
    .filter(option => mustCollect.includes(option))
    .flatMap(option => CollectedKycDataOptionToRequiredAttributes[option])
    .some(attr => !collectedData || !collectedData[attr]);

export const isMissingEmailAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  mustCollect.includes(CollectedKycDataOption.email) &&
  !collectedData?.[UserDataAttribute.email];

export const isMissingBasicAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(BASIC_ATTRIBUTES, mustCollect, collectedData);

export const isMissingResidentialAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(RESIDENTIAL_ATTRIBUTES, mustCollect, collectedData);

export const isMissingSsnAttribute = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) => isMissing(SSN_ATTRIBUTES, mustCollect, collectedData);

export const hasMissingAttributes = (
  mustCollect: CollectedKycDataOption[],
  collectedData?: UserData,
) =>
  mustCollect.some(option =>
    CollectedKycDataOptionToRequiredAttributes[option].some(
      attr => !collectedData || !collectedData[attr],
    ),
  );
