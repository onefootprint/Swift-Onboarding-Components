import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

import { BootstrapData } from '../../../types';

export type MachineContext = {
  // Inputs
  tenantPk: string;
  bootstrapData?: BootstrapData;
  // Generated
  authToken?: string;
  email?: string;
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
