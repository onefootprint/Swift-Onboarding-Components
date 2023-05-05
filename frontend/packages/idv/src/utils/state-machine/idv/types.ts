import { DeviceInfo } from '@onefootprint/hooks';
import { ObConfigAuth, OnboardingConfig } from '@onefootprint/types';

import { IdvData } from '../../../types';

export type MachineContext = {
  // Inputs
  authToken?: string;
  data?: IdvData;
  isTransfer?: boolean;
  obConfigAuth: ObConfigAuth;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
  // Generated
  validationToken?: string;
  sandboxSuffix?: string;
  userFound?: boolean;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'identifyCompleted';
      payload: {
        authToken: string;
        userFound: boolean;
        email?: string;
        phoneNumber?: string;
        sandboxSuffix?: string;
      };
    }
  | {
      type: 'onboardingCompleted';
      payload: {
        validationToken?: string;
      };
    }
  | {
      type: 'reset';
    };
