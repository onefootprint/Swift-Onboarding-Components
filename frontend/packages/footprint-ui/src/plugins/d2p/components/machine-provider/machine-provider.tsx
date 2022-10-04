import { useMachine } from '@xstate/react';
import constate from 'constate';

import D2PMachine from '../../utils/state-machine/machine';

const useLocalD2PMachine = () => useMachine(D2PMachine);

export const [MachineProvider, useD2PMachine] = constate(useLocalD2PMachine);

export default MachineProvider;
