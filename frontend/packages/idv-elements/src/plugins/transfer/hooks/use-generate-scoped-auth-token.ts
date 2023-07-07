import { getSessionId } from '@onefootprint/dev-tools';
import { D2PGenerateResponse, OnboardingConfig } from '@onefootprint/types';
import { useEffect } from 'react';

import { useLayoutOptions } from '../../../components/layout/components/layout-options-provider';
import useD2PGenerate from '../../../hooks/api/hosted/onboarding/d2p/use-d2p-generate';
import { DeviceInfo } from '../../../hooks/ui/use-device-info';

type GenerateScopedAuthTokenArgs = {
  authToken?: string;
  device?: DeviceInfo;
  config?: OnboardingConfig;
  onSuccess?: (data: D2PGenerateResponse) => void;
};

const useGenerateScopedAuthToken = ({
  authToken,
  device,
  onSuccess,
}: GenerateScopedAuthTokenArgs) => {
  const d2pGenerateMutation = useD2PGenerate();
  const opener = device?.type ?? 'unknown';
  const sessionId = getSessionId();
  const { appearance } = useLayoutOptions();
  const styleParams = appearance ? JSON.stringify(appearance) : undefined;

  const generateScopedAuthToken = () => {
    if (
      d2pGenerateMutation.isLoading ||
      d2pGenerateMutation.isSuccess ||
      !authToken
    ) {
      return;
    }
    d2pGenerateMutation.mutate(
      {
        authToken,
        meta: {
          opener,
          sessionId,
          styleParams,
        },
      },
      {
        onSuccess,
      },
    );
  };

  useEffect(() => {
    generateScopedAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authToken,
    opener,
    styleParams,
    sessionId,
    d2pGenerateMutation.isLoading,
    d2pGenerateMutation.isSuccess,
    onSuccess,
  ]);

  return { mutation: d2pGenerateMutation, generateScopedAuthToken };
};

export default useGenerateScopedAuthToken;
