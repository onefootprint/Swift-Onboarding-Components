import React from 'react';

import MachineProvider from './components/machine-provider';
import Router from './pages/router';
import type { LivenessProps } from './types';

const AppWithMachine = ({ context, onDone }: LivenessProps) => {
  const { customData, ...restOfContext } = context;
  const { isInIframe } = customData || {};
  const initialContext = { ...restOfContext, isInIframe: !!isInIframe };
  return (
    <MachineProvider initialContext={initialContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};
export default AppWithMachine;
