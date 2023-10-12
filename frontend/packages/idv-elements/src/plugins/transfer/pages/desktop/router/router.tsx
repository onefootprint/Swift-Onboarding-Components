import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../../hooks/ui/use-log-state-machine';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
import ConfirmContinueOnDesktop from '../confirm-continue-on-desktop';
import QRCodeScanned from '../qr-code-scanned';
import QRCodeSent from '../qr-code-sent';
import QRRegister from '../qr-register';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useDesktopMachine();
  const isDone = state.matches('success') || state.matches('failure');
  useLogStateMachine('transfer-desktop', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return (
    <>
      {state.matches('qrCodeScanned') && <QRCodeScanned />}
      {state.matches('qrCodeSent') && <QRCodeSent />}
      {state.matches('qrRegister') && <QRRegister />}
      {state.matches('confirmContinueOnDesktop') && (
        <ConfirmContinueOnDesktop />
      )}
    </>
  );
};

export default Router;
