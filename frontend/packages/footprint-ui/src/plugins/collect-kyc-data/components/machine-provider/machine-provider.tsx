import { useMachine } from '@xstate/react';
import constate from 'constate';

import collectKycDataMachine from '../../utils/state-machine/machine';

const useLocalCollectKycDataMachine = () => useMachine(collectKycDataMachine);

export const [MachineProvider, useCollectKycDataMachine] = constate(
  useLocalCollectKycDataMachine,
);

export default MachineProvider;
