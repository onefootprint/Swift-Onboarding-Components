import { OnboardingConfig } from '../data';

export type GetOnboardingConfigRequest = {
  tenantPk: string;
};

export type GetOnboardingConfigResponse = OnboardingConfig;
