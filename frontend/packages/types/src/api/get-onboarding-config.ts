import type { ObConfigAuth, OnboardingConfig, PublicOnboardingConfig } from '../data';
import type { WorkflowRequestConfig } from './entity-actions';

export type GetOnboardingConfigRequest = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string;
};

export type GetOnboardingConfigResponse = OnboardingConfig;

export type GetPublicOnboardingConfigResponse = {
  config: PublicOnboardingConfig;
  /** This is not a function of the playbook, it is a function of the specific session */
  workflowRequest?: HostedWorkflowRequest;
};

export type HostedWorkflowRequest = {
  note?: string;
  config: WorkflowRequestConfig;
};
