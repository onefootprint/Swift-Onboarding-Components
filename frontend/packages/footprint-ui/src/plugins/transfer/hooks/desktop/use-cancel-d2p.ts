import { D2PStatusUpdate } from '@onefootprint/types';

import { useUpdateD2PStatus } from '../../../../hooks';
import useDesktopMachine, { Events } from './use-desktop-machine';

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
          send({ type: Events.qrCodeCanceled });
        },
      },
    );
  };
};

export default useCancelD2P;
