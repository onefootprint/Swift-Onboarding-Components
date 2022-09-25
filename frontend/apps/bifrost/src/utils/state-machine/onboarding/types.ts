import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedDataOption, TenantInfo, UserData } from '@onefootprint/types';
import {
  BasicInformation,
  ResidentialAddress,
  SSNInformation,
} from 'src/utils/state-machine/types';

export enum States {
  onboardingVerification = 'onboardingVerification',
  initOnboarding = 'initOnboarding',
  additionalDataRequired = 'additionalDataRequired',
  webAuthn = 'webAuthn',
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
  webAuthnCompleted = 'webAuthnCompleted',
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
  | { type: Events.webAuthnCompleted }
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
