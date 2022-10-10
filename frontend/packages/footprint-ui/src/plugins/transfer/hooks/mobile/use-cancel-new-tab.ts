import { D2PStatusUpdate } from '@onefootprint/types';

import useUpdateD2PStatus from '../use-update-d2p-status';
import useMobileMachine, { Events } from './use-mobile-machine';

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
          send({ type: Events.newTabRegisterCanceled });
        },
      },
    );
  };
};

export default useCancelNewTab;
