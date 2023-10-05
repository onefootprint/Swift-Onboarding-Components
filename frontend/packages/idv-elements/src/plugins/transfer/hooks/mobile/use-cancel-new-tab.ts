import { Logger } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import { D2PStatusUpdate } from '@onefootprint/types';

import { useUpdateD2PStatus } from '../../../../hooks';
import useMobileMachine from './use-mobile-machine';

const useCancelNewTab = () => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();

  return () => {
    if (!scopedAuthToken) {
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
          console.error(
            'Failed to cancel D2P session from mobile bifrost',
            getErrorMessage(error),
          );
          Logger.error(
            'Failed to cancel D2P session from mobile bifrost',
            'transfer-mobile',
          );
        },
      },
    );
  };
};

export default useCancelNewTab;
