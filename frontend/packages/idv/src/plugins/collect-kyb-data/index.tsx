import React from 'react';

import type { CollectKybDataProps } from './collect-kyb-data.types';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { MachineContext } from './utils/state-machine';

const App = ({ idvContext, context, onDone }: CollectKybDataProps) => {
  const {
    config,
    kybRequirement,
    // TODO: add support for kyb bootstrap data in the future
    kycRequirement,
    kycUserData,
  } = context;
  const initContext: MachineContext = {
    idvContext,
    config,
    kybRequirement,
    kycRequirement,
    kycUserData,
    data: {}, // TODO: add support for kyb bootstrap data in the future
  };

  return (
    <MachineProvider args={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default App;
