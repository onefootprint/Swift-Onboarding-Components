import {
  CollectedDataOption,
  TenantInfo,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';

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
  missingAttributes: CollectedDataOption[];
  data: UserData;
  validationToken?: string;
};

export enum States {
  init = 'init',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  confirm = 'confirm',
  completed = 'completed',
}

export type MachineContext = {
  // Plugin context
  tenant?: TenantInfo;
  authToken?: string;
  userFound?: boolean;
  // Machine generated
  missingAttributes: CollectedDataOption[];
  data: UserData;
};

export enum Events {
  receivedContext = 'receivedContext',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  confirmed = 'confirmed',
}

export enum Actions {
  assignInitialContext = 'assignInitialContext',
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        missingAttributes: CollectedDataOption[];
        userFound: boolean;
        tenant: TenantInfo;
      };
    }
  | {
      type: Events.basicInformationSubmitted;
      payload: { basicInformation: BasicInformation };
    }
  | {
      type: Events.residentialAddressSubmitted;
      payload: {
        residentialAddress: ResidentialAddress;
      };
    }
  | {
      type: Events.ssnSubmitted;
      payload: SSNInformation;
    }
  | { type: Events.navigatedToPrevPage }
  | { type: Events.confirmed };
