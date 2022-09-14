import { DeviceInfo } from 'hooks';
import {
  BasicInformation,
  ResidentialAddress,
  SSNInformation,
  TenantInfo,
} from 'src/utils/state-machine/types';
import { CollectedDataOption, UserData } from 'types';

export enum States {
  onboardingVerification = 'onboardingVerification',
  initOnboarding = 'initOnboarding',
  additionalDataRequired = 'additionalDataRequired',
  livenessRegister = 'livenessRegister',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  onboardingComplete = 'onboardingComplete',
}

export type MachineContext = {
  userFound: boolean;
  missingWebauthnCredentials: boolean;
  missingAttributes: readonly CollectedDataOption[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  tenant: TenantInfo;
  device: DeviceInfo;
  authToken?: string;
  validationToken?: string;
};

export enum Events {
  onboardingVerificationCompleted = 'onboardingVerificationCompleted',
  onboardingStarted = 'onboardingStarted',
  additionalInfoRequired = 'additionalInfoRequired',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  navigatedToPrevPage = 'navigatedToPrevPage',
}

export enum Actions {
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebauthnCredentials',
  assignValidationToken = 'assignValidationToken',

  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

export type MachineEvents =
  | {
      type: Events.onboardingVerificationCompleted;
      payload: {
        missingAttributes: readonly CollectedDataOption[];
        missingWebauthnCredentials: boolean;
        validationToken?: string;
      };
    }
  | { type: Events.onboardingStarted }
  | { type: Events.additionalInfoRequired }
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
  | { type: Events.navigatedToPrevPage };
