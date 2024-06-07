import type { BusinessBoKycData, ObConfigAuth, PublicOnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: PublicOnboardingConfig;
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
        onboardingConfig?: PublicOnboardingConfig;
      };
    }
  | { type: 'introductionCompleted' }
  | { type: 'idvCompleted' };
