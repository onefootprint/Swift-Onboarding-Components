import React from 'react';

import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { CollectKycDataProps } from './types';
import allAttributes from './utils/all-attributes';
import getInitData from './utils/get-init-data';
import type { MachineContext } from './utils/state-machine';

const App = ({ idvContext, context, onDone }: CollectKycDataProps) => {
  const { authToken, device } = idvContext;
  const { config, requirement, userData, disabledFields } = context;
  const cdos = allAttributes(requirement);
  const initData = getInitData(cdos, userData, disabledFields);
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
