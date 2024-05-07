import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { DocumentRequestKind } from '@onefootprint/types';
import { useMemo } from 'react';

import type { TransferRequirements } from '../../types';

const useCreateHandoffUrl = ({
  authToken,
  onboardingConfig,
  baseUrl = HANDOFF_BASE_URL,
  language = 'en',
  missingRequirements,
}: {
  authToken?: string;
  onboardingConfig?: PublicOnboardingConfig;
  baseUrl?: string;
  language?: string;
  missingRequirements?: TransferRequirements;
}) =>
  useMemo(() => {
    if (!authToken || !onboardingConfig || !missingRequirements) {
      return undefined;
    }

    const { isAppClipEnabled, isInstantAppEnabled, appClipExperienceId } =
      onboardingConfig;
    const newUrl = new URL(baseUrl);

    if (hasAppClipMissingCapability(missingRequirements)) {
      if (isAppClipEnabled && isInstantAppEnabled) {
        newUrl.pathname = `appclip-instant/${appClipExperienceId}`;
      } else if (isAppClipEnabled) {
        newUrl.pathname = `appclip/${appClipExperienceId}`;
      } else if (isInstantAppEnabled) {
        newUrl.pathname = `instant-app`;
      }
    }

    const params = new URLSearchParams();
    const randomSeed = Math.floor(Math.random() * 1000).toString();
    params.append('r', randomSeed);
    if (language !== 'en') {
      params.append('lng', language);
    }
    newUrl.search = params.toString();
    newUrl.hash = encodeURI(authToken);

    return newUrl;
  }, [authToken, onboardingConfig, baseUrl, language, missingRequirements]);

const hasAppClipMissingCapability = (
  missingRequirements: TransferRequirements,
) =>
  !missingRequirements.documents
    .filter(d => !d.isMet)
    .some(d => d.config.kind !== DocumentRequestKind.Identity);

export default useCreateHandoffUrl;
