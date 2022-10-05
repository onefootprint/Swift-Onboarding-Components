import { useMachine } from '@xstate/react';
import constate from 'constate';
import handoffMachine from 'src/utils/state-machine';

const useLocalHandoffMachine = () => useMachine(handoffMachine);

export const [HandoffMachineProvider, useHandoffMachine] = constate(
  useLocalHandoffMachine,
);

export default HandoffMachineProvider;
