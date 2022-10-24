import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedDataOption, TenantInfo, UserData } from '@onefootprint/types';

import {
  BasicInformation,
  ResidentialAddress,
  SSNInformation,
} from '../data-types';

export type OnboardingData = {
  missingAttributes: CollectedDataOption[];
  data: UserData;
  validationToken?: string;
};

export enum States {
  // Initial Collection
  init = 'init',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
  // Confirm
  confirm = 'confirm',
  basicInfoEditDesktop = 'basicInfoEditDesktop',
  addressEditDesktop = 'addressEditDesktop',
  identityEditDesktop = 'identityEditDesktop',

  startKyc = 'startKyc',
  completed = 'completed',
}

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  tenant?: TenantInfo;
  authToken?: string;
  userFound?: boolean;
  // Machine generated
  missingAttributes: CollectedDataOption[];
  data: UserData;
  kycPending?: boolean;
};

export enum Events {
  receivedContext = 'receivedContext',
  basicInformationSubmitted = 'basicInformationSubmitted',
  residentialAddressSubmitted = 'residentialAddressSubmitted',
  ssnSubmitted = 'ssnSubmitted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  confirmed = 'confirmed',
  editBasicInfo = 'editBasicInfo',
  editAddress = 'editAddress',
  editIdentity = 'editIdentity',
  returnToSummary = 'returnToSummary',
}

export enum Actions {
  assignInitialContext = 'assignInitialContext',
  assignBasicInformation = 'assignBasicInformation',
  assignResidentialAddress = 'assignResidentialAddress',
  assignSsn = 'assignSsn',
  assignKycPending = 'assignKycPending',
}

export type MachineEvents =
  | {
      type: Events.receivedContext;
      payload: {
        authToken: string;
        missingAttributes: CollectedDataOption[];
        userFound: boolean;
        device: DeviceInfo;
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
  | {
      type: Events.confirmed;
      payload?: {
        kycPending?: boolean;
      };
    }
  | { type: Events.editBasicInfo }
  | { type: Events.editAddress }
  | { type: Events.editIdentity }
  | { type: Events.returnToSummary };
