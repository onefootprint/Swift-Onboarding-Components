export enum States {
  emailIdentification = 'emailIdentification',
  basicInformation = 'basicInformation',
  phoneVerification = 'phoneVerification',
  verificationSuccess = 'verificationSuccess',
  additionalInfoRequired = 'additionalInfoRequired',
  phoneRegistration = 'phoneRegistration',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  registrationSuccess = 'registrationSuccess',
}

export enum Events {
  userFound = 'userFound',
  userNotFound = 'userNotFound',
  changeEmail = 'changeEmail',
  phoneSubmitted = 'phoneSubmitted',
  userCreated = 'userCreated',
  userInherited = 'userInherited',
  collectAdditionalInfo = 'collectAdditionalInfo',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  registrationCompleted = 'registrationCompleted',
}

export enum Actions {
  assignIdentification = 'assignIdentification',
  assignEmail = 'assignEmail',
  resetContext = 'resetContext',
  assignAuthTokenWithMissingAttributes = 'assignTokenWithMissingAttributes',
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

export type Identification = Partial<{
  email: string;
  phoneNumberLastTwo: string;
  challengeToken: string;
}>;

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

export type Registration = {
  missingAttributes: Set<UserDataAttribute>;
  data: UserData;
};

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

export type BifrostContext = {
  identification: Identification;
  registration: Registration;
  authToken?: string;
};

export type BifrostEvent =
  | {
      type: Events.userFound;
      payload: Identification;
    }
  | { type: Events.userNotFound; payload: { email: string } }
  | { type: Events.changeEmail }
  | {
      type: Events.userCreated;
      payload: { authToken: string; missingAttributes: Set<UserDataAttribute> };
    }
  | {
      type: Events.userInherited;
      payload: { authToken: string; missingAttributes: Set<UserDataAttribute> };
    }
  | {
      type: Events.collectAdditionalInfo;
    }
  | {
      type: Events.phoneSubmitted;
      payload: {
        phoneNumberLastTwo: string;
        challengeToken: string;
      };
    }
  | {
      type: Events.basicInformationSubmitted;
      payload: {
        basicInformation: BasicInformation;
      };
    }
  | {
      type: Events.residentialAddressSubmitted;
      payload: {
        residentialAddress: ResidentialAddress;
      };
    }
  | { type: Events.ssnSubmitted; payload: { ssn: string } }
  | { type: Events.registrationCompleted };
