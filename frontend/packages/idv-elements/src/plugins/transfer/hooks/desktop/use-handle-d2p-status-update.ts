import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { D2PStatus } from '@onefootprint/types';

import Logger from '../../../../utils/logger';
import useDesktopMachine from './use-desktop-machine';

const useHandleD2PStatusUpdate = () => {
  const [, send] = useDesktopMachine();

  const handleSuccess = (response: GetD2PResponse) => {
    const { status } = response;
    if (status === D2PStatus.completed) {
      send({
        type: 'qrRegisterSucceeded',
      });
    }
    if (status === D2PStatus.failed) {
      send({ type: 'qrRegisterFailed' });
    }
    if (status === D2PStatus.canceled) {
      send({ type: 'qrCodeCanceled' });
    }
    if (status === D2PStatus.inProgress) {
      // If the user pressed "send link via sms", we already sent the 'qrCodeSent' and transitioned to another page
      // The only way to get this status while still on this page is if the user scanned the qr code
      send({
        type: 'qrCodeScanned',
      });
    }
  };

  const handleError = (error?: unknown) => {
    Logger.warn(
      `Encountered error while polling for status on transfer plugin on desktop, likely indicating expired session. ${getErrorMessage(
        error,
      )}`,
      'transfer-desktop',
    );
    send({
      type: 'statusPollingErrored',
    });
  };

  return { handleSuccess, handleError };
};

export default useHandleD2PStatusUpdate;
