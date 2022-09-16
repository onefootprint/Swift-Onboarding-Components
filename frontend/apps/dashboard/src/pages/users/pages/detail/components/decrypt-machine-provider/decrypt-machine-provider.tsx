import { useMachine } from '@xstate/react';
import constate from 'constate';

import { decryptStateMachine } from '../../utils/decrypt-state-machine';

const useLocalMachine = () => useMachine(decryptStateMachine);

const [DecryptMachineProvider, useDecryptMachine] = constate(useLocalMachine);

export default DecryptMachineProvider;

export { useDecryptMachine };
