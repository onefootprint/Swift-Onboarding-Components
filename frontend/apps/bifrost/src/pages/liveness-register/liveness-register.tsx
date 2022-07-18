import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/liveness-register';
import withProvider from 'src/utils/with-provider';

import MachineProvider from './components/machine-provider';
import useLivenessRegisterMachine from './hooks/use-liveness-register';
import NewTabProcessing from './pages/new-tab-processing';
import NewTabRequest from './pages/new-tab-request';
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
    [States.newTabProcessing]: NewTabProcessing,
    [States.newTabRequest]: NewTabRequest,
    [States.qrCodeScanned]: QRCodeScanned,
    [States.qrCodeSent]: QRCodeSent,
    [States.qrRegister]: QRRegister,
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
