import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/liveness-check/types';
import withProvider from 'src/utils/with-provider';

import LivenessCheckMachineProvider from './components/machine-provider';
import useLivenessCheckMachine from './hooks/use-liveness-check-machine';
import QrRegister from './pages/qr-register';

type Page = {
  [page in States]?: () => JSX.Element;
};

const LivenessCheck = () => {
  const [state] = useLivenessCheckMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.qrRegister]: QrRegister,
  };

  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default () => withProvider(LivenessCheckMachineProvider, LivenessCheck);
