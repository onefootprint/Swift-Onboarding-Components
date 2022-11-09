import { D2PStatus, GetD2PResponse } from '@onefootprint/types';

import { useGetD2PStatus } from '../../../../hooks';
import useMobileMachine, { Events, MachineContext } from './use-mobile-machine';

const useNewTabStatusUpdate = () => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab }: MachineContext = state.context;

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

  useGetD2PStatus(true, scopedAuthToken ?? '', {
    onSuccess: handleSuccess,
    onError: handleError,
  });
};

export default useNewTabStatusUpdate;
