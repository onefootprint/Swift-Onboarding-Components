import { useMachine } from '@xstate/react';
import constate from 'constate';

import { createIdDocMachine, MachineContext } from '../../utils/state-machine';

export type IdDocMachineArgs = {
  args: MachineContext;
  initState?: string;
};
const useLocalIdDocMachine = ({ args, initState }: IdDocMachineArgs) =>
  useMachine(() => createIdDocMachine(args, initState));

export const [MachineProvider, useIdDocMachine] =
  constate(useLocalIdDocMachine);

export default MachineProvider;
