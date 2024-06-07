import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { MachineContext } from '../../utils/state-machine';
import createTransferMachine from '../../utils/state-machine';

type MachineArgs = {
  initialContext: MachineContext;
};

const useLocalMachine = ({ initialContext }: MachineArgs) => useMachine(() => createTransferMachine(initialContext));

export const [TransferMachineProvider, useTransferMachine] = constate(useLocalMachine);

export default TransferMachineProvider;
