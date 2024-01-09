import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import {
  MachineProvider,
  useInvestorProfileMachine,
} from './components/machine-provider';
import type { InvestorProfileProps } from './investor-profile.types';
import Router from './pages/router';

const App = ({ context, onDone }: InvestorProfileProps) => {
  const [, send] = useInvestorProfileMachine();
  const { authToken, device, customData } = context;

  useEffectOnce(() => {
    send({
      type: 'receivedContext',
      payload: {
        device,
        authToken,
        showTransition: customData?.showTransition,
      },
    });
  });

  return <Router onDone={onDone} />;
};

const AppWithMachine = ({ context, onDone }: InvestorProfileProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
