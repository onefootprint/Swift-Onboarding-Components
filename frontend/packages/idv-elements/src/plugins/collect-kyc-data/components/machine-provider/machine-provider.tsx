import { useMachine } from '@xstate/react';
import constate from 'constate';

import {
  createCollectKycDataMachine,
  MachineContext,
} from '../../utils/state-machine';

type CollectKycDataMachineArgs = {
  initialContext: MachineContext;
  initState?: string;
};

const useLocalCollectKycDataMachine = ({
  initialContext,
  initState,
}: CollectKycDataMachineArgs) =>
  useMachine(() => createCollectKycDataMachine(initialContext, initState));

export const [MachineProvider, useCollectKycDataMachine] = constate(
  useLocalCollectKycDataMachine,
);

export default MachineProvider;
