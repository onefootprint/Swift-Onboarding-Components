import { useMachine } from '@xstate/react';
import constate from 'constate';
import bifrostMachine from 'src/utils/state-machine/bifrost';

const useLocalBifrostMachine = () => useMachine(bifrostMachine);

export const [BifrostMachineProvider, useBifrostMachine] = constate(
  useLocalBifrostMachine,
);

export default BifrostMachineProvider;
