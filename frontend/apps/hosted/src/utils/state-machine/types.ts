import {
  BusinessBoKycData,
  ObConfigAuth,
  OnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth?: ObConfigAuth;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: OnboardingConfig;
};

export type MachineEvents =
  | { type: 'reset' }
  | { type: 'expired' }
  | {
      type: 'initContextUpdated';
      payload: {
        obConfigAuth?: ObConfigAuth;
        businessBoKycData?: BusinessBoKycData;
        onboardingConfig?: OnboardingConfig;
      };
    }
  | { type: 'introductionCompleted' };
