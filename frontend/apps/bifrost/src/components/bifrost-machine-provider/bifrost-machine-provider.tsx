import { useMachine } from '@xstate/react';
import constate from 'constate';
import bifrostMachine from 'src/bifrost-machine';

const useLocalBifrostMachine = () => useMachine(bifrostMachine);

export const [BifrostMachineProvider, useBifrostMachine] = constate(
  useLocalBifrostMachine,
);
