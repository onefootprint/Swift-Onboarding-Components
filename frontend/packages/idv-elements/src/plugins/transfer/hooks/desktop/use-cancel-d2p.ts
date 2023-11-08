import { getErrorMessage } from '@onefootprint/request';
import { D2PStatusUpdate } from '@onefootprint/types';

import { useUpdateD2PStatus } from '../../../../hooks';
import Logger from '../../../../utils/logger';
import useDesktopMachine from './use-desktop-machine';

const useCancelD2P = () => {
  const [state, send] = useDesktopMachine();
  const authToken = state.context.scopedAuthToken;
  const updateD2PStatusMutation = useUpdateD2PStatus();

  return () => {
    if (!authToken || updateD2PStatusMutation.isLoading) {
      return;
    }
    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess() {
          send({ type: 'qrCodeCanceled' });
        },
        onError: (error: unknown) => {
          Logger.error(
            `Failed to cancel D2P session from desktop bifrost. ${getErrorMessage(
              error,
            )}`,
            'transfer-desktop',
          );
          send({
            type: 'd2pSessionExpired',
          });
        },
      },
    );
  };
};

export default useCancelD2P;
