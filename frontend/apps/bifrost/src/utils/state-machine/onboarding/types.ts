import {
  BasicInformation,
  DeviceInfo,
  ResidentialAddress,
  UserData,
  UserDataAttribute,
} from 'src/utils/state-machine/types';

export enum States {
  init = 'init',
  additionalDataRequired = 'additionalDataRequired',
  livenessRegister = 'livenessRegister',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  onboardingSuccess = 'onboardingSuccess',
}

export type MachineContext = {
  userFound: boolean;
  missingWebauthnCredentials: boolean;
  missingAttributes: readonly UserDataAttribute[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  device: DeviceInfo;
  authToken?: string;
};

export enum Events {
  onboardingStarted = 'onboardingStarted',
  additionalInfoRequired = 'additionalInfoRequired',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
}

export enum Actions {
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

export type MachineEvents =
  | { type: Events.onboardingStarted }
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
