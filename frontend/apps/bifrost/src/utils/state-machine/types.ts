import { BootstrapData, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  config?: OnboardingConfig;
  validationToken?: string;
  bootstrapData?: BootstrapData;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        bootstrapData?: BootstrapData;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'idvCompleted';
      payload: {
        validationToken?: string;
      };
    }
  | {
      type: 'reset';
    };
