import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

import { BootstrapData } from '../../../idv.types';

export type MachineContext = {
  // Inputs
  tenantPk: string;
  bootstrapData?: BootstrapData;
  // Generated
  authToken?: string;
  device?: DeviceInfo;
  config?: OnboardingConfig;
  userFound?: boolean;
  email?: string;
  validationToken?: string;
  sandboxSuffix?: string;
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
      type: 'sandboxOutcomeSubmitted';
      payload: {
        sandboxSuffix: string;
      };
    }
  | {
      type: 'identifyCompleted';
      payload: {
        authToken: string;
        userFound: boolean;
        email?: string;
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
