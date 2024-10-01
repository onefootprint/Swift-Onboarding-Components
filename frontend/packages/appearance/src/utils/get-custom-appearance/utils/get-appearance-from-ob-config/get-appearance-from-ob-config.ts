import type { FootprintAppearance } from '@onefootprint/footprint-js';
import type { GetPublicOnboardingConfigResponse } from '@onefootprint/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CLIENT_PUBLIC_KEY_HEADER = 'X-Onboarding-Config-Key';
const KYB_BO_SESSION_AUTHORIZATION_HEADER = 'X-Kyb-Bo-Token';
const AUTH_HEADER = 'x-fp-authorization';

type OnboardingConfigRequestType = {
  authToken?: string;
  kybBoAuthToken?: string;
  obConfig?: string;
};

const getAuthHeaders = (payload: OnboardingConfigRequestType) => {
  const headers: Record<string, string> = {};
  const { authToken, kybBoAuthToken, obConfig } = payload;
  if (obConfig) {
    headers[CLIENT_PUBLIC_KEY_HEADER] = obConfig;
  } else if (kybBoAuthToken) {
    headers[KYB_BO_SESSION_AUTHORIZATION_HEADER] = kybBoAuthToken;
  } else if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }
  return headers;
};

const getOnboardingConfig = async (authHeaders: Record<string, string>): Promise<GetPublicOnboardingConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/hosted/onboarding/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const tenant = await response.json();
  return tenant;
};

const getAppearanceFromObConfig = async (payload: OnboardingConfigRequestType): Promise<FootprintAppearance | null> => {
  const authHeaders = getAuthHeaders(payload);
  if (!Object.values(authHeaders).length) {
    return null;
  }

  try {
    const tenant = await getOnboardingConfig(authHeaders);
    return tenant.appearance || null;
  } catch (_) {
    return null;
  }
};

export default getAppearanceFromObConfig;
