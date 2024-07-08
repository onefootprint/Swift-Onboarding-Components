import type { BusinessBoKycData, HostedUrlType, ObConfigAuth, PublicOnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: PublicOnboardingConfig;
  urlType?: HostedUrlType;
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
        urlType?: HostedUrlType;
      };
    }
  | { type: 'introductionCompleted' }
  | { type: 'idvCompleted' };
