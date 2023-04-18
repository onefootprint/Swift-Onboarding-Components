import { useMachine } from '@xstate/react';
import constate from 'constate';

import createIdentifyMachine, {
  IdentifyMachineArgs,
} from '../../utils/state-machine';

const useLocalIdentifyMachine = (args: IdentifyMachineArgs) =>
  useMachine(() => createIdentifyMachine(args));

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(
  useLocalIdentifyMachine,
);

export default IdentifyMachineProvider;
