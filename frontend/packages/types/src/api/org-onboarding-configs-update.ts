import type { OnboardingConfig } from '../data';

export type OrgOnboardingConfigUpdateRequest = {
  id: string;
  name?: string;
  promptForPasskey?: boolean;
};

export type OrgOnboardingConfigUpdateResponse = OnboardingConfig;
