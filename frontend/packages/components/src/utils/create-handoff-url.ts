import type { PublicOnboardingConfig } from '@onefootprint/types';

const HANDOFF_BASE_URL =
  process.env.HANDOFF_BASE_URL || 'https://handoff.onefootprint.com';

const createHandoffUrl = ({
  authToken,
  onboardingConfig,
  baseUrl = HANDOFF_BASE_URL,
  language = 'en',
}: {
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
  baseUrl?: string;
  language?: string;
}): string | undefined => {
  if (!authToken || !onboardingConfig) {
    throw new Error('authToken and onboardingConfig are required');
  }

  const { isAppClipEnabled, isInstantAppEnabled, appClipExperienceId } =
    onboardingConfig;
  const newUrl = new URL(baseUrl);
  if (isAppClipEnabled && isInstantAppEnabled) {
    newUrl.pathname = `appclip-instant/${appClipExperienceId}`;
  } else if (isAppClipEnabled) {
    newUrl.pathname = `appclip/${appClipExperienceId}`;
  } else if (isInstantAppEnabled) {
    newUrl.pathname = `instant-app`;
  }

  const params = new URLSearchParams();
  const randomSeed = Math.floor(Math.random() * 1000).toString();
  params.append('r', randomSeed);
  if (language !== 'en') {
    params.append('lng', language);
  }
  newUrl.search = params.toString();
  newUrl.hash = encodeURI(authToken);

  return newUrl.toString();
};

export default createHandoffUrl;
