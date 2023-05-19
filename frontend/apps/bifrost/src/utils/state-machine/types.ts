import { IdvBootstrapData, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  config?: OnboardingConfig;
  validationToken?: string;
  bootstrapData?: IdvBootstrapData;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        bootstrapData?: IdvBootstrapData;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'reset';
    };
