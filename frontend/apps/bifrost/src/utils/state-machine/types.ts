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

// Labels sent from the backend for each attribute
export const UserDataAttributeLabels: Record<string, UserDataAttribute> = {
  first_name: UserDataAttribute.firstName,
  last_name: UserDataAttribute.lastName,
  dob: UserDataAttribute.dob,
  email: UserDataAttribute.email,
  ssn9: UserDataAttribute.ssn9,
  ssn4: UserDataAttribute.ssn4,
  address_line1: UserDataAttribute.addressLine1,
  address_line2: UserDataAttribute.addressLine2,
  city: UserDataAttribute.city,
  state: UserDataAttribute.state,
  country: UserDataAttribute.country,
  zip: UserDataAttribute.zip,
  phone_number: UserDataAttribute.phone,
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
  missingAttributes: readonly UserDataAttribute[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  validationToken?: string;
};

export type TenantInfo = {
  canAccessDataKinds: UserDataAttribute[];
  isLive?: boolean;
  mustCollectDataKinds: UserDataAttribute[];
  name: string;
  orgName: string;
  pk: string;
};
