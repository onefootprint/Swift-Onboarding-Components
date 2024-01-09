import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import MachineProvider, {
  useLivenessMachine,
} from './components/machine-provider';
import Router from './pages/router';
import type { LivenessProps } from './types';

const App = ({ context, onDone }: LivenessProps) => {
  const [, send] = useLivenessMachine();
  const { authToken, device, isTransfer } = context;

  useEffectOnce(() => {
    send({
      type: 'receivedContext',
      payload: {
        isTransfer,
        authToken,
        device,
      },
    });
  });

  return <Router onDone={onDone} />;
};

const AppWithMachine = ({ context, onDone }: LivenessProps) => (
  <MachineProvider>
    <App context={context} onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
