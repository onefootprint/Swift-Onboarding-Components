export enum States {
  // Identify
  emailIdentification = 'emailIdentification',
  verificationSuccess = 'verificationSuccess',
  phoneRegistration = 'phoneRegistration', // Email not associated with an existing user, asking for phone

  // Challenge
  phoneVerification = 'phoneVerification', // Existing user phone gets pin code

  // Onboarding
  additionalDataRequired = 'additionalDataRequired',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  onboardingSuccess = 'registrationSuccess',
}

export enum Events {
  // Identify
  emailChangeRequested = 'emailChangeRequested',
  userIdentifiedByEmail = 'userIdentifiedByEmail',
  userIdentifiedByPhone = 'userIdentifiedByPhone',
  userNotIdentified = 'userNotIdentified',

  // Biometric Challenge
  smsChallengeResent = 'smsChallengeResent',
  challengeSucceeded = 'challengeSucceeded',

  // Onboarding Events
  additionalInfoRequired = 'additionalInfoRequired',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
}

export enum Actions {
  // Identify & Challenge
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  resetContext = 'resetContext',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignChallenge = 'assignChallengeData',

  // Onboarding
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebAuthnCredentials',
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

// TODO: do we put phone number here? or last two?
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
  biometrics = 'biometric',
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

export type BifrostContext = {
  email: string;
  phone?: string;
  userFound: boolean;
  authToken?: string;
  challenge?: ChallengeData;
  onboarding: OnboardingData;
};

export type BifrostEvent =
  | { type: Events.emailChangeRequested }
  | {
      type: Events.userIdentifiedByEmail;
      payload: {
        email: string;
        userFound: boolean;
        challengeData?: ChallengeData; // only if user found
      };
    }
  | {
      type: Events.userIdentifiedByPhone;
      payload: {
        phone: string;
        userFound: boolean;
        challengeData?: ChallengeData; // only if user found
      };
    }
  | {
      type: Events.userNotIdentified;
      payload: {
        email?: string;
        phone?: string;
        userFound: boolean;
      };
    }
  | {
      type: Events.smsChallengeResent;
      payload: { challenge: ChallengeData };
    }
  | {
      type: Events.challengeSucceeded;
      payload: {
        authToken: string;
        missingAttributes: readonly UserDataAttribute[];
        missingWebauthnCredentials: boolean;
      };
    }
  | { type: Events.additionalInfoRequired }
  | {
      type: Events.basicInformationSubmitted;
      payload: { basicInformation: BasicInformation };
    }
  | {
      type: Events.residentialAddressSubmitted;
      payload: { residentialAddress: ResidentialAddress };
    }
  | { type: Events.ssnSubmitted; payload: { [UserDataAttribute.ssn]: string } };
