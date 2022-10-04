import { useMachine } from '@xstate/react';
import constate from 'constate';

import machine from '../../utils/machine';

const useLocalMachine = () => useMachine(machine);

export const [MachineProvider, useLivenessMachine] = constate(useLocalMachine);

export default MachineProvider;
