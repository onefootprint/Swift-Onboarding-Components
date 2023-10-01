import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { IdentifyMachineArgs } from '../../utils/state-machine';
import createIdentifyMachine from '../../utils/state-machine';

type IdentifyMachineProviderArgs = {
  args: IdentifyMachineArgs;
};

const useLocalIdentifyMachine = ({ args }: IdentifyMachineProviderArgs) =>
  useMachine(() => createIdentifyMachine(args));

export const [IdentifyMachineProvider, useIdentifyMachine] = constate(
  useLocalIdentifyMachine,
);

export default IdentifyMachineProvider;
