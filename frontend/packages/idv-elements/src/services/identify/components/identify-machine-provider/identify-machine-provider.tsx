import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { IdentifyMachineArgs } from '../../utils/state-machine';
import createIdentifyMachine from '../../utils/state-machine';

const useLocalIdentifyMachine = (args: IdentifyMachineArgs) =>
  useMachine(() => createIdentifyMachine(args));

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(
  useLocalIdentifyMachine,
);

export default IdentifyMachineProvider;
