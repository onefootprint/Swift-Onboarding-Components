import { useMachine } from '@xstate/react';
import constate from 'constate';

import PlaybookMachine from './utils/machine';

const useLocalPlaybookMachine = () => useMachine(PlaybookMachine);

export const [PlaybookMachineProvider, usePlaybookMachine] = constate(
  useLocalPlaybookMachine,
);

export default PlaybookMachineProvider;
