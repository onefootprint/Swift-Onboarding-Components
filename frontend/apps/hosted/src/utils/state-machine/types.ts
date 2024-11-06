import type {
  BusinessBoKycData,
  HostedUrlType,
  HostedWorkflowRequest,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
  businessBoKycData?: BusinessBoKycData;
  onboardingConfig?: PublicOnboardingConfig;
  workflowRequest?: HostedWorkflowRequest;
  urlType?: HostedUrlType;
  error?: unknown;
};

export type MachineEvents =
  | { type: 'reset' }
  | { type: 'errorReceived'; payload: { error: unknown } }
  | {
      type: 'initContextUpdated';
      payload: {
        obConfigAuth?: ObConfigAuth;
        authToken?: string;
        businessBoKycData?: BusinessBoKycData;
        onboardingConfig?: PublicOnboardingConfig;
        workflowRequest?: HostedWorkflowRequest;
        urlType?: HostedUrlType;
      };
    }
  | { type: 'introductionCompleted' }
  | { type: 'idvCompleted' };
