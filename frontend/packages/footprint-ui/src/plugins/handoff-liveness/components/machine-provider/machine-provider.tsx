import { useMachine } from '@xstate/react';
import constate from 'constate';

import HandoffLivenessMachine from '../../utils/state-machine/machine';

const useLocalHandoffLivenessMachine = () => useMachine(HandoffLivenessMachine);

export const [MachineProvider, useHandoffLivenessMachine] = constate(
  useLocalHandoffLivenessMachine,
);

export default MachineProvider;
