import { useMachine } from '@xstate/react';
import constate from 'constate';

import idDocMachine from '../../utils/state-machine/machine';

const useLocalIdDocMachine = () => useMachine(idDocMachine);

export const [MachineProvider, useIdDocMachine] =
  constate(useLocalIdDocMachine);

export default MachineProvider;
