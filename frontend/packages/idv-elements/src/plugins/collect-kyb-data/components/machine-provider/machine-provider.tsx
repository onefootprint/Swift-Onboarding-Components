import { useMachine } from '@xstate/react';
import constate from 'constate';

import {
  createCollectKybDataMachine,
  MachineContext,
} from '../../utils/state-machine';

type CollectKybDataMachineArgs = {
  args: MachineContext;
};

const useLocalCollectKybDataMachine = ({ args }: CollectKybDataMachineArgs) =>
  useMachine(() => createCollectKybDataMachine(args));

export const [MachineProvider, useCollectKybDataMachine] = constate(
  useLocalCollectKybDataMachine,
);

export default MachineProvider;
