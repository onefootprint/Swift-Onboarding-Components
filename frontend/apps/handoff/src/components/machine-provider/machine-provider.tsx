import { useMachine } from '@xstate/react';
import constate from 'constate';

import handoffMachine from '../../utils/state-machine';

const useLocalHandoffMachine = () => useMachine(handoffMachine);

export const [HandoffMachineProvider, useHandoffMachine] = constate(
  useLocalHandoffMachine,
);

export default HandoffMachineProvider;
