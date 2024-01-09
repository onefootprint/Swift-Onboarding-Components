import React from 'react';

import type { CollectKybDataProps } from './collect-kyb-data.types';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: CollectKybDataProps) => {
  const { authToken, customData, device } = context;
  if (!customData) {
    return null;
  }

  const {
    config,
    userFound,
    kybRequirement,
    // TODO: add support for kyb bootstrap data in the future
    kycRequirement,
    kycBootstrapData,
  } = customData;
  const initContext: MachineContext = {
    device,
    authToken,
    config,
    userFound,
    kybRequirement,
    kycRequirement,
    kycBootstrapData,
    data: {}, // TODO: add support for kyb bootstrap data in the future
  };

  return (
    <MachineProvider args={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default App;
