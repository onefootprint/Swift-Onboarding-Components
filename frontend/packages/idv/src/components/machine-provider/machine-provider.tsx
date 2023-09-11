import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { IdvMachineArgs } from '../../utils/state-machine/idv/machine';
import createIdvMachine from '../../utils/state-machine/idv/machine';

type IdvMachineProviderArgs = {
  args: IdvMachineArgs;
};

const useLocalIdvMachine = ({ args }: IdvMachineProviderArgs) =>
  useMachine(() => createIdvMachine(args));

export const [MachineProvider, useIdvMachine] = constate(useLocalIdvMachine);

export default MachineProvider;
