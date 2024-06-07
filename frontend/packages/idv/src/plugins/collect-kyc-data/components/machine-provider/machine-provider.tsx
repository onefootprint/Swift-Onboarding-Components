import { useMachine } from '@xstate/react';
import constate from 'constate';

import { createCollectKycDataMachine } from '../../utils/state-machine';
import type { InitMachineArgs } from '../../utils/state-machine/machine';

type CollectKycDataMachineArgs = {
  initialContext: InitMachineArgs;
  initState?: string;
};

const useLocalCollectKycDataMachine = ({ initialContext, initState }: CollectKycDataMachineArgs) =>
  useMachine(() => createCollectKycDataMachine(initialContext, initState));

export const [MachineProvider, useCollectKycDataMachine] = constate(useLocalCollectKycDataMachine);

export default MachineProvider;
