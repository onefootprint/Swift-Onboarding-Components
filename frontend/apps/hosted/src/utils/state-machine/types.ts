import { BusinessBoKycData, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: OnboardingConfig;
};

export type MachineEvents =
  | { type: 'reset' }
  | {
      type: 'initContextUpdated';
      payload: {
        authToken?: string;
        businessBoKycData?: BusinessBoKycData;
        onboardingConfig?: OnboardingConfig;
      };
    }
  | { type: 'introductionCompleted' };
