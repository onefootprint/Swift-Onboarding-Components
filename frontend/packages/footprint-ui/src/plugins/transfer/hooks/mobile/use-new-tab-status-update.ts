import { D2PStatus, GetD2PResponse } from '@onefootprint/types';

import useGetD2pStatus from '../use-get-d2p-status';
import useMobileMachine, { Events } from './use-mobile-machine';

const useNewTabStatusUpdate = () => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab } = state.context;

  const handleSuccess = (response: GetD2PResponse) => {
    const { status } = response;
    if (status === D2PStatus.completed) {
      send({
        type: Events.newTabRegisterSucceeded,
      });
    }
    if (status === D2PStatus.failed) {
      send({
        type: Events.newTabRegisterFailed,
      });
    }
    if (status === D2PStatus.canceled) {
      tab?.close();
      send({
        type: Events.newTabRegisterCanceled,
      });
    }
  };

  const handleError = () => {
    tab?.close();
    send({
      type: Events.statusPollingErrored,
    });
  };

  useGetD2pStatus(scopedAuthToken ?? '', {
    onSuccess: handleSuccess,
    onError: handleError,
  });
};

export default useNewTabStatusUpdate;
