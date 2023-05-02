import { DeviceInfo } from '@onefootprint/hooks';
import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';

import { KycData } from '../../types';
import {
  BasicInformation,
  ResidentialAddress,
  SSNInformation,
} from '../data-types';

export type OnboardingData = {
  missingAttributes: CollectedKycDataOption[];
  data: KycData;
  validationToken?: string;
};

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
  userFound?: boolean;
  config?: OnboardingConfig;
  receivedEmail?: boolean; // Whether received non-empty email from initial context
  sandboxSuffix?: string; // only if in sandbox mode
  fixedData?: KycData;
  // Machine generated
  missingAttributes: CollectedKycDataOption[];
  data: KycData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        missingAttributes: CollectedKycDataOption[];
        userFound: boolean;
        device: DeviceInfo;
        email?: string;
        sandboxSuffix?: string;
        config: OnboardingConfig;
        fixedData?: KycData;
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
