import { Logger } from '@/idv/utils';
import { getSessionIdFromStorage } from '@onefootprint/dev-tools';
import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { DocumentRequestKind } from '@onefootprint/types';
import { useMemo } from 'react';

import type { TransferRequirements } from '../../types';

const useCreateHandoffUrl = ({
  authToken,
  baseUrl = HANDOFF_BASE_URL,
  language = 'en',
  missingRequirements,
  onboardingConfig,
}: {
  authToken?: string;
  baseUrl?: string;
  language?: string;
  missingRequirements?: TransferRequirements;
  onboardingConfig?: PublicOnboardingConfig;
}) =>
  useMemo(() => {
    if (!authToken || !onboardingConfig || !missingRequirements) {
      return undefined;
    }

    const { isAppClipEnabled, isInstantAppEnabled, appClipExperienceId } = onboardingConfig;
    const newUrl = new URL(baseUrl);

    if (hasAppClipMissingCapability(missingRequirements)) {
      if (isAppClipEnabled && isInstantAppEnabled) {
        newUrl.pathname = `appclip-instant/${appClipExperienceId}`;
      } else if (isAppClipEnabled) {
        newUrl.pathname = `appclip/${appClipExperienceId}`;
      } else if (isInstantAppEnabled) {
        newUrl.pathname = 'instant-app';
      }
    }

    const params = new URLSearchParams();
    const fpSessionId = getSessionIdFromStorage();
    const randomSeed = Math.floor(Math.random() * 1000).toString();
    const loggerGlobalContext = Logger.getGlobalContext();

    if (language !== 'en') {
      params.append('lng', language);
    }
    if (fpSessionId) {
      params.append('xfpsessionid', fpSessionId);
    }
    if (loggerGlobalContext?.sdkVersion) {
      params.append('sdkv', String(loggerGlobalContext.sdkVersion));
    }
    params.append('r', randomSeed);

    newUrl.search = params.toString();
    newUrl.hash = encodeURI(authToken);

    return newUrl;
  }, [authToken, onboardingConfig, baseUrl, language, missingRequirements]);

const hasAppClipMissingCapability = (missingRequirements: TransferRequirements) =>
  !missingRequirements.documents.filter(d => !d.isMet).some(d => d.config.kind !== DocumentRequestKind.Identity);

export default useCreateHandoffUrl;
