import useD2PGenerate from 'src/hooks/d2p/use-d2p-generate';
import useLivenessRegisterMachine from 'src/pages/liveness-register/hooks/use-liveness-register';
import { Events } from 'src/utils/state-machine/liveness-register';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [, send] = useLivenessRegisterMachine();

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
