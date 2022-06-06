export enum UserDataAttribute {
  firstName = 'firstName',
  lastName = 'lastName',
  dob = 'dob',
  email = 'email',
  ssn = 'ssn',
  streetAddress = 'streetAddress',
  streetAddress2 = 'streetAddress2',
  city = 'city',
  state = 'state',
  country = 'country',
  zip = 'zip',
}

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
  [UserDataAttribute.country]: string;
  [UserDataAttribute.zip]: string;
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

export enum ChallengeKind {
  sms = 'sms',
  biometric = 'biometric',
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
