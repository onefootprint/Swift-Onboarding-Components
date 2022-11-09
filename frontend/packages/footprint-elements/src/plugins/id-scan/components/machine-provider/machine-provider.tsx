import { useMachine } from '@xstate/react';
import constate from 'constate';

import idScanMachine from '../../utils/state-machine/machine';

const useLocalIdScanMachine = () => useMachine(idScanMachine);

export const [MachineProvider, useIdScanMachine] = constate(
  useLocalIdScanMachine,
);

export default MachineProvider;
