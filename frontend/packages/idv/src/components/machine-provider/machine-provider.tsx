import { useMachine } from '@xstate/react';
import constate from 'constate';

import createIdvMachine, {
  IdvMachineArgs,
} from '../../utils/state-machine/machine';

const useLocalIdvMachine = (args: IdvMachineArgs) =>
  useMachine(() => createIdvMachine(args));

export const [MachineProvider, useIdvMachine] = constate(useLocalIdvMachine);

export default MachineProvider;
