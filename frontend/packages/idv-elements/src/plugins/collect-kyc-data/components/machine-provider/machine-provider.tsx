import { useMachine } from '@xstate/react';
import constate from 'constate';

import {
  createCollectKycDataMachine,
  MachineContext,
} from '../../utils/state-machine';

type CollectKycDataMachineArgs = {
  args: MachineContext;
};

const useLocalCollectKycDataMachine = ({ args }: CollectKycDataMachineArgs) =>
  useMachine(() => createCollectKycDataMachine(args));

export const [MachineProvider, useCollectKycDataMachine] = constate(
  useLocalCollectKycDataMachine,
);

export default MachineProvider;
