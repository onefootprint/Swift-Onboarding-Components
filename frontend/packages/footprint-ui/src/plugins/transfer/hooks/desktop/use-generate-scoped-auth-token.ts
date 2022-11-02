import { useD2PGenerate } from '../../../../hooks';
import useDesktopMachine, { Events } from './use-desktop-machine';

const useGenerateScopedAuthToken = () => {
  const d2pGenerateMutation = useD2PGenerate();
  const [, send] = useDesktopMachine();

  const generateScopedAuthToken = (authToken: string) => {
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

  return { mutation: d2pGenerateMutation, generateScopedAuthToken };
};

export default useGenerateScopedAuthToken;
