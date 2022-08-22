import type { CountryCode } from 'types';

export enum UserDataAttribute {
  firstName = 'firstName',
  lastName = 'lastName',
  dob = 'dob',
  email = 'email',
  phone = 'phone_number',
  ssn9 = 'ssn9',
  ssn4 = 'ssn4',
  addressLine1 = 'address_line1',
  addressLine2 = 'address_line2',
  city = 'city',
  state = 'state',
  country = 'country',
  zip = 'zip',
}

export enum CollectedDataOption {
  name = 'name',
  dob = 'dob',
  ssn4 = 'ssn4',
  ssn9 = 'ssn9',
  fullAddress = 'full_address',
  partialAddress = 'partial_address',
  email = 'email',
  phoneNumber = 'phone_number',
}

// Labels sent from the backend for each attribute
export const CollectedDataOptionLabels: Record<string, CollectedDataOption> = {
  name: CollectedDataOption.name,
  dob: CollectedDataOption.dob,
  email: CollectedDataOption.email,
  ssn9: CollectedDataOption.ssn9,
  ssn4: CollectedDataOption.ssn4,
  full_address: CollectedDataOption.fullAddress,
  partial_address: CollectedDataOption.partialAddress,
  phone_number: CollectedDataOption.phoneNumber,
};

export const OptionToRequiredAttributes: Record<
  CollectedDataOption,
  UserDataAttribute[]
> = {
  [CollectedDataOption.name]: [
    UserDataAttribute.firstName,
    UserDataAttribute.lastName,
  ],
  [CollectedDataOption.dob]: [UserDataAttribute.dob],
  [CollectedDataOption.ssn4]: [UserDataAttribute.ssn4],
  [CollectedDataOption.ssn9]: [UserDataAttribute.ssn9],
  [CollectedDataOption.fullAddress]: [
    UserDataAttribute.addressLine1,
    UserDataAttribute.city,
    UserDataAttribute.state,
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedDataOption.partialAddress]: [
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedDataOption.email]: [UserDataAttribute.email],
  [CollectedDataOption.phoneNumber]: [UserDataAttribute.phone],
};

export type UserData = Partial<{
  [UserDataAttribute.firstName]: string;
  [UserDataAttribute.lastName]: string;
  [UserDataAttribute.dob]: string;
  [UserDataAttribute.email]: string;
  [UserDataAttribute.ssn9]: string;
  [UserDataAttribute.ssn4]: string;
  [UserDataAttribute.addressLine1]: string;
  [UserDataAttribute.addressLine2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string;
  [UserDataAttribute.country]: CountryCode;
  [UserDataAttribute.zip]: string;
  [UserDataAttribute.phone]: string;
}>;

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

export enum IdentifyType {
  onboarding = 'onboarding',
  my1fp = 'my1fp',
}

export enum UserKind {
  userInherited = 'user_inherited',
  userCreated = 'user_created',
}

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
