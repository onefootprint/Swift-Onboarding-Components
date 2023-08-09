import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import type { OnboardingConfig } from '@onefootprint/types';

const createHandoffUrl = ({
  authToken,
  onboardingConfig,
  baseUrl = HANDOFF_BASE_URL,
}: {
  authToken?: string;
  onboardingConfig?: OnboardingConfig;
  baseUrl?: string;
}) => {
  if (!authToken || !onboardingConfig) {
    return undefined;
  }

  const newUrl = new URL(baseUrl);
  if (onboardingConfig) {
    newUrl.pathname = 'appclip';
  }

  // If the user opens a handoff url when there is an old handoff session,
  // the distinct query param will force the page to re-load.
  // For now, generate at most 3 digits to randomize the url. Chance of a
  // user generating the same url twice is 0.001^2.
  const params = new URLSearchParams();
  const randomSeed = Math.floor(Math.random() * 1000).toString();
  params.append('r', randomSeed);
  params.append('tenant_id', onboardingConfig.tenantId);
  newUrl.search = params.toString();

  newUrl.hash = encodeURI(authToken);
  return newUrl.toString();
};

export default createHandoffUrl;
