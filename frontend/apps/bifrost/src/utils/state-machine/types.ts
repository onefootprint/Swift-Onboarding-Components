import type { CountryCode } from 'types';

export enum UserDataAttribute {
  firstName = 'firstName',
  lastName = 'lastName',
  dob = 'dob',
  email = 'email',
  phone = 'phone_number',
  ssn = 'ssn',
  lastFourSsn = 'last_four_ssn',
  streetAddress = 'streetAddress',
  streetAddress2 = 'streetAddress2',
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
  ssn: UserDataAttribute.ssn,
  last_four_ssn: UserDataAttribute.lastFourSsn,
  street_address: UserDataAttribute.streetAddress,
  street_address2: UserDataAttribute.streetAddress2,
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
  [UserDataAttribute.ssn]: string;
  [UserDataAttribute.lastFourSsn]: string;
  [UserDataAttribute.streetAddress]: string;
  [UserDataAttribute.streetAddress2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string;
  [UserDataAttribute.country]: CountryCode;
  [UserDataAttribute.zip]: string;
  [UserDataAttribute.phone]: string;
}>;

export type BasicInformation = Required<
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
    | UserDataAttribute.streetAddress
    | UserDataAttribute.streetAddress2
    | UserDataAttribute.city
    | UserDataAttribute.zip
    | UserDataAttribute.state
  >
>;

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
