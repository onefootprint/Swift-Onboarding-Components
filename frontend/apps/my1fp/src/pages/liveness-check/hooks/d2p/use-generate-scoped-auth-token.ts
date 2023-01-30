import useSessionUser from 'src/hooks/use-session-user';
import useLivenessCheckMachine from 'src/pages/liveness-check/hooks/use-liveness-check-machine';
import { Events } from 'src/utils/state-machine/liveness-check/types';

import useD2PGenerate from '../../pages/qr-register/hooks/use-generate-d2p';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [state, send] = useLivenessCheckMachine();
  const { session } = useSessionUser();
  const authToken = session?.authToken ?? '';

  return () =>
    d2pGenerateMutation.mutate(
      {
        authToken,
        meta: {
          opener: state.context.device?.type ?? 'unknown',
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
};

export default useGenerateScopedAuthToken;
