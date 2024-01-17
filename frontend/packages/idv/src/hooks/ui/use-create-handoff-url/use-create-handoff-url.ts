import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useMemo } from 'react';

const useCreateHandoffUrl = ({
  authToken,
  onboardingConfig,
  baseUrl = HANDOFF_BASE_URL,
  language = 'en',
}: {
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
  baseUrl?: string;
  language?: string;
}) =>
  useMemo(() => {
    if (!authToken || !onboardingConfig) {
      return undefined;
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
  }, [authToken, onboardingConfig, baseUrl, language]);

export default useCreateHandoffUrl;
