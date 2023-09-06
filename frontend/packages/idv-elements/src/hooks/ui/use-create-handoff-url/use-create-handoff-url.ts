import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useMemo } from 'react';

const useCreateHandoffUrl = ({
  authToken,
  onboardingConfig,
  baseUrl = HANDOFF_BASE_URL,
}: {
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
  baseUrl?: string;
}) =>
  useMemo(() => {
    if (!authToken || !onboardingConfig) {
      return undefined;
    }

    const newUrl = new URL(baseUrl);
    if (onboardingConfig.isAppClipEnabled) {
      newUrl.pathname = `appclip/${onboardingConfig.appClipExperienceId}`;
    }

    const params = new URLSearchParams();
    const randomSeed = Math.floor(Math.random() * 1000).toString();
    params.append('r', randomSeed);
    newUrl.search = params.toString();

    newUrl.hash = encodeURI(authToken);
    return newUrl.toString();
  }, [authToken, onboardingConfig, baseUrl]);

export default useCreateHandoffUrl;
