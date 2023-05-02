import { BusinessBoKycData, OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  tenantPk?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: OnboardingConfig;
};

export type MachineEvents =
  | { type: 'reset' }
  | { type: 'expired' }
  | {
      type: 'initContextUpdated';
      payload: {
        tenantPk?: string;
        authToken?: string;
        businessBoKycData?: BusinessBoKycData;
        onboardingConfig?: OnboardingConfig;
      };
    }
  | { type: 'introductionCompleted' }
  | { type: 'idvCompleted' };
