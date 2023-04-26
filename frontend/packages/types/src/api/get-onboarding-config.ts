import { OnboardingConfig } from '../data';

export type GetOnboardingConfigRequest =
  | {
      tenantPk: string;
    }
  | {
      kybBoAuthToken: string;
    };

export type GetOnboardingConfigResponse = OnboardingConfig;
