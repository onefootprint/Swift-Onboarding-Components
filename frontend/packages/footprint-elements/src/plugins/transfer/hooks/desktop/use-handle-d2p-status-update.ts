import { D2PStatus, GetD2PResponse } from '@onefootprint/types';

import useDesktopMachine, { Events } from './use-desktop-machine';

const useHandleD2PStatusUpdate = () => {
  const [, send] = useDesktopMachine();

  const handleSuccess = (response: GetD2PResponse) => {
    const { status } = response;
    if (status === D2PStatus.completed) {
      send({
        type: Events.qrRegisterSucceeded,
      });
    }
    if (status === D2PStatus.failed) {
      send({ type: Events.qrRegisterFailed });
    }
    if (status === D2PStatus.canceled) {
      send({ type: Events.qrCodeCanceled });
    }
    if (status === D2PStatus.inProgress) {
      // If the user pressed "send link via sms", we already sent the Events.qrCodeSent and transitioned to another page
      // The only way to get this status while still on this page is if the user scanned the qr code
      send({
        type: Events.qrCodeScanned,
      });
    }
  };

  const handleError = () => {
    send({
      type: Events.statusPollingErrored,
    });
  };

  return { handleSuccess, handleError };
};

export default useHandleD2PStatusUpdate;
