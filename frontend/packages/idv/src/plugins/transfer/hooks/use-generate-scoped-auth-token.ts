import { useAppearance } from '@onefootprint/appearance';
import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import type {
  D2PGenerateResponse,
  IdDocOutcome,
  L10n,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { useEffect } from 'react';

import useD2PGenerate from '../../../hooks/api/hosted/onboarding/d2p/use-d2p-generate';
import type { DeviceInfo } from '../../../hooks/ui/use-device-info';
import { Logger } from '../../../utils/logger';

type GenerateScopedAuthTokenArgs = {
  authToken: string;
  device: DeviceInfo;
  config?: PublicOnboardingConfig;
  onSuccess?: (data: D2PGenerateResponse) => void;
  idDocOutcome?: IdDocOutcome;
  l10n?: L10n;
};

const useGenerateScopedAuthToken = ({
  authToken,
  device,
  onSuccess,
  idDocOutcome,
  l10n,
}: GenerateScopedAuthTokenArgs) => {
  const d2pGenerateMutation = useD2PGenerate();
  const sessionId = getSessionId();
  const appearance = useAppearance();
  const styleParams = appearance ? JSON.stringify(appearance) : undefined;

  const generateScopedAuthToken = () => {
    const isMobile = device.type === 'mobile' || device.type === 'tablet';
    const redirectUrl = isMobile ? window.location.href : undefined;

    if (!authToken || d2pGenerateMutation.isLoading) {
      return;
    }
    d2pGenerateMutation.mutate(
      {
        authToken,
        meta: {
          opener: device.type,
          sessionId,
          styleParams,
          sandboxIdDocOutcome: idDocOutcome,
          redirectUrl,
          l10n,
        },
      },
      {
        onSuccess,
        onError: (error: unknown) => {
          Logger.warn(
            `Error while generating d2p token in transfer plugin on ${
              device?.type ?? 'NA'
            } device type. ${getErrorMessage(error)}`,
            { location: 'transfer' },
          );
        },
      },
    );
  };

  useEffect(() => {
    if (d2pGenerateMutation.isLoading || d2pGenerateMutation.isSuccess) {
      return;
    }

    generateScopedAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authToken,
    styleParams,
    sessionId,
    d2pGenerateMutation.isLoading,
    d2pGenerateMutation.isSuccess,
    onSuccess,
  ]);

  return { mutation: d2pGenerateMutation, generateScopedAuthToken };
};

export default useGenerateScopedAuthToken;
