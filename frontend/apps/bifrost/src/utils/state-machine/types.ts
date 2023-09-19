import type {
  IdvBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  config?: PublicOnboardingConfig;
  validationToken?: string;
  bootstrapData?: IdvBootstrapData;
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: PublicOnboardingConfig;
        bootstrapData?: IdvBootstrapData;
        showCompletionPage?: boolean;
        showLogo?: boolean;
      };
    }
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'reset';
    }
  | {
      type: 'expireSession';
    };
