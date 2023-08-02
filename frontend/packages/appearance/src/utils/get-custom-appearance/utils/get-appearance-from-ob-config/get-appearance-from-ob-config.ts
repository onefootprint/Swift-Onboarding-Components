import { FootprintAppearance } from '@onefootprint/footprint-js';
import { GetOnboardingConfigResponse } from '@onefootprint/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getOnboardingConfig = async (
  onboardingConfigKey: string,
): Promise<GetOnboardingConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Onboarding-Config-Key': onboardingConfigKey,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const tenant = await response.json();
  return tenant;
};

const getAppearanceFromObConfig = async (
  obConfigKey?: string,
): Promise<FootprintAppearance | null> => {
  if (!obConfigKey) {
    return null;
  }

  try {
    const tenant = await getOnboardingConfig(obConfigKey);
    return tenant.appearance || null;
  } catch (_) {
    return null;
  }
};

export default getAppearanceFromObConfig;
