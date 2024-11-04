import { useAppearance } from '@onefootprint/appearance';
import { getSessionId } from '@onefootprint/dev-tools';
import type { D2PGenerateResponse, IdDocOutcome, L10n } from '@onefootprint/types';
import { useEffect } from 'react';

import { getLogger } from '@/idv/utils';
import type { DeviceInfo } from '..';
import { useD2PGenerate } from '../../queries';

type GenerateScopedAuthTokenArgs = {
  authToken: string;
  device: DeviceInfo;
  idDocOutcome?: IdDocOutcome;
  l10n?: L10n;
  onError?: (error: unknown) => void;
  onSuccess?: (data: D2PGenerateResponse) => void;
};

const { logError } = getLogger({ location: 'd2p token generator' });

const useGenerateScopedAuthToken = ({
  authToken,
  device,
  idDocOutcome,
  l10n,
  onError,
  onSuccess,
}: GenerateScopedAuthTokenArgs) => {
  const d2pGenerateMutation = useD2PGenerate();
  const sessionId = getSessionId();
  const appearance = useAppearance();
  const styleParams = appearance ? JSON.stringify(appearance) : undefined;

  const generateScopedAuthToken = () => {
    const isMobile = device.type === 'mobile' || device.type === 'tablet';
    const redirectUrl = isMobile ? window.location.href : undefined;

    if (!authToken || d2pGenerateMutation.isPending) {
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
          logError(
            `Error while generating d2p token in transfer plugin on ${device?.type ?? 'NA'} device type.`,
            error,
          );
          onError?.(error);
        },
      },
    );
  };

  useEffect(() => {
    if (d2pGenerateMutation.isPending || d2pGenerateMutation.isSuccess) {
      return;
    }

    generateScopedAuthToken();
    // no onSuccess because likely to trigger infinite re-render/loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, styleParams, sessionId, d2pGenerateMutation.isPending, d2pGenerateMutation.isSuccess]);

  return { mutation: d2pGenerateMutation, generateScopedAuthToken };
};

export default useGenerateScopedAuthToken;
