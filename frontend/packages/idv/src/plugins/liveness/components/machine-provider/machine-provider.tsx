import { useMachine } from '@xstate/react';
import constate from 'constate';

import LivenessMachine from '../../utils/state-machine/machine';

const useLocalLivenessMachine = () => useMachine(LivenessMachine);

export const [MachineProvider, useLivenessMachine] = constate(
  useLocalLivenessMachine,
);

export default MachineProvider;
