import {
  BusinessBoKycData,
  ObConfigAuth,
  OnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: OnboardingConfig;
};

export type MachineEvents =
  | { type: 'reset' }
  | { type: 'invalidUrlReceived' }
  | { type: 'expired' }
  | {
      type: 'initContextUpdated';
      payload: {
        obConfigAuth?: ObConfigAuth;
        authToken?: string;
        businessBoKycData?: BusinessBoKycData;
        onboardingConfig?: OnboardingConfig;
      };
    }
  | { type: 'introductionCompleted' };
