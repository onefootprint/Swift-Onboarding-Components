import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';
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

  if (state.matches('qrCodeScanned')) {
    return <QRCodeScanned />;
  }

  if (state.matches('qrCodeSent')) {
    return <QRCodeSent />;
  }

  if (state.matches('qrRegister')) {
    return <QRRegister />;
  }

  return null;
};

export default Router;
