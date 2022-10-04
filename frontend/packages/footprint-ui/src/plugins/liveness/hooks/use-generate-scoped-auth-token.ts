import { Events } from '../utils/machine';
import useD2PGenerate from './use-d2p-generate';
import useLivenessMachine from './use-liveness-machine';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [, send] = useLivenessMachine();

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
