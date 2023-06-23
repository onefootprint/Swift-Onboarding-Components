import { IdvBootstrapData, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  config?: OnboardingConfig;
  validationToken?: string;
  bootstrapData?: IdvBootstrapData;
  showCompletionPage?: boolean;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        bootstrapData?: IdvBootstrapData;
        showCompletionPage?: boolean;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'reset';
    };
