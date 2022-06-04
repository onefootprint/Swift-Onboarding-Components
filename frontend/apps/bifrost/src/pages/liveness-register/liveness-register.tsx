import { States } from '@src/utils/state-machine/liveness-register';
import has from 'lodash/has';
import React from 'react';
import withProvider from 'src/utils/with-provider';

import MachineProvider from './components/machine-provider';
import useLivenessMachine from './hooks/use-liveness-check';
import BiometricRegister from './pages/biometric-register';
import BiometricRegisterFailure from './pages/biometric-register-failure';
import CaptchaRegister from './pages/captcha-register';
import QRRegister from './pages/qr-register';

type Page = {
  [page in States]?: () => JSX.Element;
};

const LivenessRegister = () => {
  const [state] = useLivenessMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.biometricRegister]: BiometricRegister,
    [States.biometricRegisterFailure]: BiometricRegisterFailure,
    [States.captchaRegister]: CaptchaRegister,
    [States.qrRegister]: QRRegister,
  };
  // TODO: This needs to be fixed
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default () => withProvider(MachineProvider, LivenessRegister);
