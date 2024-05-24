import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { D2PStatus } from '@onefootprint/types';

import { Logger } from '../../../utils/logger';
import useTransferMachine from './use-machine';

const useHandleD2PStatusUpdate = () => {
  const [, send] = useTransferMachine();

  const handleSuccess = (response: GetD2PResponse) => {
    const { status } = response;
    if (status === D2PStatus.completed) {
      send({ type: 'd2pSessionCompleted' });
    } else if (status === D2PStatus.failed) {
      send({ type: 'd2pSessionFailed' });
    } else if (status === D2PStatus.canceled) {
      send({ type: 'd2pSessionCanceled' });
    } else if (status === D2PStatus.inProgress) {
      send({ type: 'd2pSessionStarted' });
    }
  };

  const handleError = (error: unknown) => {
    Logger.warn(
      `Encountered error while polling for status on transfer plugin, likely indicating expired session. ${getErrorMessage(
        error,
      )}`,
      { location: 'transfer' },
    );
    send({ type: 'd2pSessionExpired' });
  };

  return { handleSuccess, handleError };
};

export default useHandleD2PStatusUpdate;
