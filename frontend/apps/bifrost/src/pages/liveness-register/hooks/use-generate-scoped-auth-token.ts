import useD2PGenerate from 'src/hooks/d2p/use-d2p-generate';
import useLivenessRegisterMachine from 'src/pages/liveness-register/hooks/use-liveness-register';
import {
  Events,
  MachineContext,
} from 'src/utils/state-machine/liveness-register';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [state, send] = useLivenessRegisterMachine();
  const { authToken } = state.context as MachineContext;

  return () => {
    if (!authToken) {
      return;
    }
    d2pGenerateMutation.mutate(
      { authToken },
      {
        onSuccess({ authToken: scopedToken }) {
          send({
            type: Events.scopedAuthTokenGenerated,
            payload: {
              scopedAuthToken: scopedToken,
            },
          });
        },
      },
    );
  };
};

export default useGenerateScopedAuthToken;
