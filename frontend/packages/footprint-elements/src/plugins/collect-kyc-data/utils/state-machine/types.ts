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

export type MachineEvents =
  | {
      type: 'receivedContext';
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
      type: 'emailSubmitted';
      payload: {
        email?: string;
      };
    }
  | {
      type: 'basicInformationSubmitted';
      payload: {
        basicInformation: BasicInformation;
      };
    }
  | {
      type: 'residentialAddressSubmitted';
      payload: {
        residentialAddress: ResidentialAddress;
      };
    }
  | {
      type: 'ssnSubmitted';
      payload: SSNInformation;
    }
  | { type: 'navigatedToPrevPage' }
  | { type: 'confirmed' }
  | { type: 'editEmail' }
  | { type: 'editBasicInfo' }
  | { type: 'editAddress' }
  | { type: 'editIdentity' }
  | { type: 'returnToSummary' };
