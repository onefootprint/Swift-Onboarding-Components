import React from 'react';

import IdScanFlow from './components/id-scan-flow';
import { MachineProvider } from './components/machine-provider';
import { IdScanProps } from './id-scan.types';

const IdScan = ({ context, onDone }: IdScanProps) => (
  <MachineProvider>
    <IdScanFlow context={context} onDone={onDone} />
  </MachineProvider>
);

export default IdScan;
