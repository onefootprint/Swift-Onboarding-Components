import { getErrorMessage } from '@onefootprint/request';
import { D2PStatusUpdate } from '@onefootprint/types';

import { useUpdateD2PStatus } from '../../../../hooks';
import Logger from '../../../../utils/logger';
import useMobileMachine from './use-mobile-machine';

const useCancelNewTab = () => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();

  return () => {
    if (!scopedAuthToken || updateD2PStatusMutation.isLoading) {
      return;
    }
    tab?.close();
    updateD2PStatusMutation.mutate(
      { authToken: scopedAuthToken, status: D2PStatusUpdate.canceled },
      {
        onSuccess() {
          send({ type: 'newTabRegisterCanceled' });
        },
        onError: (error: unknown) => {
          Logger.error(
            `Failed to cancel D2P session from mobile bifrost. ${getErrorMessage(
              error,
            )}`,
            'transfer-mobile',
          );
          send({
            type: 'd2pSessionExpired',
          });
        },
      },
    );
  };
};

export default useCancelNewTab;
