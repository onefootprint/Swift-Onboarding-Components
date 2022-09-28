import { useD2PMachine } from '../components/machine-provider';
import { Events } from '../utils/state-machine/types';
import useD2PGenerate from './use-d2p-generate';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [, send] = useD2PMachine();

  return (authToken: string) => {
    if (d2pGenerateMutation.isLoading) {
      return;
    }
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
