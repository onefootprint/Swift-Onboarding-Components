import { D2PStatusUpdate } from '@onefootprint/types';

import { useUpdateD2PStatus } from '../../../../hooks';
import useDesktopMachine from './use-desktop-machine';

const useCancelD2P = () => {
  const [state, send] = useDesktopMachine();
  const authToken = state.context.scopedAuthToken;
  const updateD2PStatusMutation = useUpdateD2PStatus();

  return () => {
    if (!authToken) {
      return;
    }
    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess() {
          send({ type: 'qrCodeCanceled' });
        },
      },
    );
  };
};

export default useCancelD2P;
