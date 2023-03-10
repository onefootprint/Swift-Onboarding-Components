import React from 'react';
import { IdentifyMachineProvider } from 'src/components/identify-machine-provider';
import { IdentifyMachineArgs } from 'src/utils/state-machine/identify';

import Router, { DonePayload } from './pages/router';

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
