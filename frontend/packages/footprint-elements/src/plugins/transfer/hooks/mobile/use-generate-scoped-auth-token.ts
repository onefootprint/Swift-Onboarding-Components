import { getSessionId } from '@onefootprint/dev-tools';
import { useEffect } from 'react';

import { useD2PGenerate } from '../../../../hooks';
import useMobileMachine, { Events } from './use-mobile-machine';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [state, send] = useMobileMachine();
  const { authToken, device } = state.context;
  const opener = device?.type ?? 'unknown';
  const sessionId = getSessionId();

  useEffect(() => {
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
        },
      },
      {
        onSuccess(data) {
          send({
            type: Events.scopedAuthTokenGenerated,
            payload: {
              scopedAuthToken: data.authToken,
            },
          });
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, d2pGenerateMutation.isLoading, d2pGenerateMutation.isSuccess]);

  return d2pGenerateMutation;
};

export default useGenerateScopedAuthToken;
