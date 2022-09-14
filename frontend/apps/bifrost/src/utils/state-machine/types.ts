import { CollectedDataOption, UserData, UserDataAttribute } from 'types';

export type BasicInformation = NameInformation | NameAndDobInformation;

export type NameInformation = Required<
  Pick<UserData, UserDataAttribute.firstName | UserDataAttribute.lastName>
>;

export type NameAndDobInformation = Required<
  Pick<
    UserData,
    | UserDataAttribute.firstName
    | UserDataAttribute.lastName
    | UserDataAttribute.dob
  >
>;

export type ResidentialAddress =
  | ResidentialZipCodeAndCountry
  | ResidentialAddressFull;

export type ResidentialZipCodeAndCountry = Required<
  Pick<UserData, UserDataAttribute.country | UserDataAttribute.zip>
>;

export type ResidentialAddressFull = Required<
  Pick<
    UserData,
    | UserDataAttribute.country
    | UserDataAttribute.addressLine1
    | UserDataAttribute.addressLine2
    | UserDataAttribute.city
    | UserDataAttribute.zip
    | UserDataAttribute.state
  >
>;

export type SSN4Information = {
  [UserDataAttribute.ssn4]: string;
};

export type SSN9Information = {
  [UserDataAttribute.ssn9]: string;
};

export type SSNInformation = SSN4Information | SSN9Information;

export type OnboardingData = {
  missingWebauthnCredentials: boolean;
  missingAttributes: readonly CollectedDataOption[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  validationToken?: string;
};

export type TenantInfo = {
  canAccessData: CollectedDataOption[];
  isLive?: boolean;
  mustCollectData: CollectedDataOption[];
  name: string;
  orgName: string;
  pk: string;
};
