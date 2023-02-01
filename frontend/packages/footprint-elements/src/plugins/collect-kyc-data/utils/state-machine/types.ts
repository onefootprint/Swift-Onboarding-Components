import { DeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOption,
  OnboardingConfig,
  UserData,
} from '@onefootprint/types';

import {
  BasicInformation,
  ResidentialAddress,
  SSNInformation,
} from '../data-types';

export type OnboardingData = {
  missingAttributes: CollectedKycDataOption[];
  data: UserData;
  validationToken?: string;
};

export enum States {
  // Initial Collection
  init = 'init',
  email = 'email',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  // Confirm
  confirm = 'confirm',
  emailEditDesktop = 'emailEditDesktop',
  basicInfoEditDesktop = 'basicInfoEditDesktop',
  addressEditDesktop = 'addressEditDesktop',
  identityEditDesktop = 'identityEditDesktop',

  completed = 'completed',
}

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
  userFound?: boolean;
  config?: OnboardingConfig;
  receivedEmail?: boolean; // Whether received non-empty email from initial context
  // Machine generated
  missingAttributes: CollectedKycDataOption[];
  data: UserData;
};

export enum Events {
  receivedContext = 'receivedContext',
  emailSubmitted = 'emailSubmitted',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  confirmed = 'confirmed',
  editEmail = 'editEmail',
  editBasicInfo = 'editBasicInfo',
  editAddress = 'editAddress',
  editIdentity = 'editIdentity',
  returnToSummary = 'returnToSummary',
}

export enum Actions {
  assignInitialContext = 'assignInitialContext',
  assignEmail = 'assignEmail',
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
}

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        missingAttributes: readonly CollectedKycDataOption[];
        userFound: boolean;
        device: DeviceInfo;
        email?: string;
        config: OnboardingConfig;
      };
    }
  | {
      type: Events.emailSubmitted;
      payload: {
        email?: string;
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
  | {
      type: Events.ssnSubmitted;
      payload: SSNInformation;
    }
  | { type: Events.navigatedToPrevPage }
  | { type: Events.confirmed }
  | { type: Events.editEmail }
  | { type: Events.editBasicInfo }
  | { type: Events.editAddress }
  | { type: Events.editIdentity }
  | { type: Events.returnToSummary };
