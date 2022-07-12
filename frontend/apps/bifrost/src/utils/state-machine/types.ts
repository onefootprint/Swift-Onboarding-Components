import type { CountryCode } from 'types';

export enum UserDataAttribute {
  firstName = 'firstName',
  lastName = 'lastName',
  dob = 'dob',
  email = 'email',
  phone = 'phone',
  ssn = 'ssn',
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
  street_address: UserDataAttribute.streetAddress,
  street_address2: UserDataAttribute.streetAddress2,
  city: UserDataAttribute.city,
  state: UserDataAttribute.state,
  country: UserDataAttribute.country,
  zip: UserDataAttribute.zip,
  phone: UserDataAttribute.phone,
};

export type UserData = Partial<{
  [UserDataAttribute.firstName]: string;
  [UserDataAttribute.lastName]: string;
  [UserDataAttribute.dob]: string;
  [UserDataAttribute.email]: string;
  [UserDataAttribute.ssn]: string;
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

export type ResidentialAddress = Required<
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

export enum ChallengeKind {
  sms = 'sms',
  biometric = 'biometric',
}

export enum UserKind {
  userInherited = 'user_inherited',
  userCreated = 'user_created',
}

export type ChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  phoneNumberLastTwo?: string;
  biometricChallengeJson?: string;
};

export type OnboardingData = {
  missingWebauthnCredentials: boolean;
  missingAttributes: readonly UserDataAttribute[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
};

export type DeviceInfo = {
  hasSupportForWebAuthn: boolean;
  type: string;
};

export type TenantInfo = {
  pk: string;
  name: string;
  requiredUserData: UserDataAttribute[];
};
