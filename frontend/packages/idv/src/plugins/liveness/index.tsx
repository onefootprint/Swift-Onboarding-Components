import React from 'react';

import MachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { LivenessProps } from './types';

const AppWithMachine = ({ context, onDone }: LivenessProps) => (
  <MachineProvider initialContext={context}>
    <Router onDone={onDone} />
  </MachineProvider>
);

export default AppWithMachine;
