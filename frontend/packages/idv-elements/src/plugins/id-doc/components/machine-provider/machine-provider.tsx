import { useMachine } from '@xstate/react';
import constate from 'constate';

import { createIdDocMachine, MachineContext } from '../../utils/state-machine';

export type IdDocMachineArgs = {
  args: MachineContext;
};
const useLocalIdDocMachine = ({ args }: IdDocMachineArgs) =>
  useMachine(() => createIdDocMachine(args));

export const [MachineProvider, useIdDocMachine] =
  constate(useLocalIdDocMachine);

export default MachineProvider;
