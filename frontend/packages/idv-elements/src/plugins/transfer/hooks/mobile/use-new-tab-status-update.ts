import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { D2PStatus } from '@onefootprint/types';

import { useGetD2PStatus } from '../../../../hooks';
import Logger from '../../../../utils/logger';
import useMobileMachine from './use-mobile-machine';

const useNewTabStatusUpdate = () => {
  const [state, send] = useMobileMachine();
  const { scopedAuthToken, tab } = state.context;

  const handleSuccess = (response: GetD2PResponse) => {
    const { status } = response;
    if (status === D2PStatus.completed) {
      send({
        type: 'newTabRegisterSucceeded',
      });
    }
    if (status === D2PStatus.failed) {
      send({
        type: 'newTabRegisterFailed',
      });
    }
    if (status === D2PStatus.canceled) {
      tab?.close();
      send({
        type: 'newTabRegisterCanceled',
      });
    }
  };

  const handleError = (error: unknown) => {
    Logger.warn(
      `Encountered error while polling for status on transfer plugin on mobile, likely indicating expired session. ${getErrorMessage(
        error,
      )}`,
      'transfer-mobile',
    );
    tab?.close();
    send({
      type: 'd2pSessionExpired',
    });
  };

  useGetD2PStatus({
    authToken: scopedAuthToken ?? '',
    options: {
      onSuccess: handleSuccess,
      onError: handleError,
    },
  });
};

export default useNewTabStatusUpdate;
