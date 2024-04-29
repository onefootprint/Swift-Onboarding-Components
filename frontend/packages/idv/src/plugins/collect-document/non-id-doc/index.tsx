import React from 'react';

import { MissingPermissionsSheetProvider } from '../components/missing-permissions-sheet';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { MachineContext } from './utils/state-machine';

type NonIdDocFlowProps = {
  initialContext: Pick<
    MachineContext,
    | 'authToken'
    | 'device'
    | 'orgId'
    | 'uploadMode'
    | 'config'
    | 'documentRequestId'
  >;
  onDone: () => void;
};

const NonIdDocFlow = ({ initialContext, onDone }: NonIdDocFlowProps) => (
  <MachineProvider args={initialContext}>
    <MissingPermissionsSheetProvider device={initialContext.device}>
      <Router onDone={onDone} />
    </MissingPermissionsSheetProvider>
  </MachineProvider>
);

export default NonIdDocFlow;
