import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/liveness-register';
import withProvider from 'src/utils/with-provider';

import MachineProvider from './components/machine-provider';
import useLivenessRegisterMachine from './hooks/use-liveness-register';
import BiometricRegister from './pages/biometric-register';
import BiometricRegisterFailure from './pages/biometric-register-failure';
import CaptchaRegister from './pages/captcha-register';
import QRCodeScanned from './pages/qr-code-scanned';
import QRCodeSent from './pages/qr-code-sent';
import QRRegister from './pages/qr-register';

type Page = {
  [page in States]?: () => JSX.Element;
};

const LivenessRegister = () => {
  const [state] = useLivenessRegisterMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.biometricRegister]: BiometricRegister,
    [States.biometricRegisterFailure]: BiometricRegisterFailure,
    [States.captchaRegister]: CaptchaRegister,
    [States.qrRegister]: QRRegister,
    [States.qrCodeScanned]: QRCodeScanned,
    [States.qrCodeSent]: QRCodeSent,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default () => withProvider(MachineProvider, LivenessRegister);
