import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useDesktopMachine, {
  States,
} from '../../../hooks/desktop/use-desktop-machine';
import QRCodeScanned from '../qr-code-scanned';
import QRCodeSent from '../qr-code-sent';
import QRRegister from '../qr-register';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useDesktopMachine();
  const isDone = state.matches(States.success) || state.matches(States.failure);
  useLogStateMachine('transfer-desktop', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches(States.qrCodeScanned)) {
    return <QRCodeScanned />;
  }

  if (state.matches(States.qrCodeSent)) {
    return <QRCodeSent />;
  }

  if (state.matches(States.qrRegister)) {
    return <QRRegister />;
  }

  return null;
};

export default Router;
