import useLivenessCheckMachine from 'src/pages/liveness-check/hooks/use-liveness-check-machine';
import { Events } from 'src/utils/state-machine/liveness-check/types';

import useD2PGenerate from '../../pages/qr-register/hooks/use-generate-d2p';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [, send] = useLivenessCheckMachine();

  return (authToken: string) => {
    d2pGenerateMutation.mutate(
      { authToken },
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
};

export default useGenerateScopedAuthToken;
