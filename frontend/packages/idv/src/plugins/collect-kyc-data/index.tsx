import React from 'react';

import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { CollectKycDataProps } from './types';
import allAttributes from './utils/all-attributes';
import getInitData from './utils/get-init-data';
import type { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: CollectKycDataProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const { config, requirement, bootstrapData, disabledFields } = customData;
  const cdos = allAttributes(requirement);
  const initData = getInitData(cdos, bootstrapData, disabledFields);
  const initContext: MachineContext = {
    authToken,
    device,
    config,
    requirement,
    data: initData,
    initialData: {},
  };

  return (
    <MachineProvider initialContext={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default App;
