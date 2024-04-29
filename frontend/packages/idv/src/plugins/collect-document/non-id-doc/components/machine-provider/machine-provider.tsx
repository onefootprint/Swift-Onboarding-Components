import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { MachineContext } from '../../utils/state-machine';
import createNonIdDocMachine from '../../utils/state-machine/machine';

export type NonIdDocMachineArgs = {
  args: MachineContext;
};

const useLocalNonIdDocMachine = ({ args }: NonIdDocMachineArgs) =>
  useMachine(() => createNonIdDocMachine(args));

export const [MachineProvider, useNonIdDocMachine] = constate(
  useLocalNonIdDocMachine,
);

export default MachineProvider;
