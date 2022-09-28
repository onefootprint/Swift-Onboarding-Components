import React, { useEffect } from 'react';

import { useD2PMachine } from '../../components/machine-provider';
import { States } from '../../utils/state-machine/types';
import QRCodeScanned from '../qr-code-scanned';
import QRCodeSent from '../qr-code-sent';
import QRRegister from '../qr-register';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useD2PMachine();
  const isDone = state.matches(States.success) || state.matches(States.failure);

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
