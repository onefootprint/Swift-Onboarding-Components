import React from 'react';

import { IdentifyMachineProvider } from './components/identify-machine-provider';
import Router, { DonePayload } from './pages/router';
import { IdentifyMachineArgs } from './utils/state-machine';

type IdentifyProps = Partial<IdentifyMachineArgs> & {
  onDone: (payload: DonePayload) => void;
};

const Identify = ({
  device,
  bootstrapData,
  config,
  identifierSuffix,
  onDone,
}: IdentifyProps) => {
  if (!device) {
    throw new Error('Missing identify page props');
  }

  return (
    <IdentifyMachineProvider
      device={device}
      bootstrapData={bootstrapData}
      config={config}
      identifierSuffix={identifierSuffix}
    >
      <Router onDone={onDone} />
    </IdentifyMachineProvider>
  );
};

export default Identify;
