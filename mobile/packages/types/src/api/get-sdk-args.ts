import type { PublicOnboardingConfig } from '../data/onboarding-config';

export type GetSdkArgsRequest = {
  authToken: string;
};
export type GetSdkArgsResponse = {
  args: {
    kind: string;
    data: Record<string, unknown>;
  };
  obConfig?: PublicOnboardingConfig;
};
