import React from 'react';

import type { CollectKybDataProps } from './collect-kyb-data.types';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { MachineContext } from './utils/state-machine';

const CollectKybData = ({ idvContext, context, onDone }: CollectKybDataProps) => {
  const { bootstrapBusinessData, bootstrapUserData, config, kybRequirement, kycRequirement } = context;
  const initContext: MachineContext = {
    idvContext,
    config,
    kybRequirement,
    kycRequirement,
    bootstrapUserData,
    bootstrapBusinessData,
    data: {},
  };

  return (
    <MachineProvider args={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default CollectKybData;
