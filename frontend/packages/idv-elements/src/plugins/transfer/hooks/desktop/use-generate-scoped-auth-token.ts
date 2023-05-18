import { getSessionId } from '@onefootprint/dev-tools';
import { useEffect } from 'react';

import { useLayoutOptions } from '../../../../components/layout';
import { useD2PGenerate } from '../../../../hooks';
import useDesktopMachine from './use-desktop-machine';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [state, send] = useDesktopMachine();
  const { appearance } = useLayoutOptions();
  const { authToken, device } = state.context;
  const opener = device?.type ?? 'unknown';
  const sessionId = getSessionId();

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
          styleParams: appearance ? JSON.stringify(appearance) : undefined,
        },
      },
      {
        onSuccess(data) {
          send({
            type: 'scopedAuthTokenGenerated',
            payload: {
              scopedAuthToken: data.authToken,
            },
          });
        },
      },
    );
  };

  useEffect(() => {
    generateScopedAuthToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, d2pGenerateMutation.isLoading, d2pGenerateMutation.isSuccess]);

  return { mutation: d2pGenerateMutation, generateScopedAuthToken };
};

export default useGenerateScopedAuthToken;
