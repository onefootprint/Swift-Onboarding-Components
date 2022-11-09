import { useMachine } from '@xstate/react';
import constate from 'constate';

import MobileMachine from '../../utils/mobile-state-machine';

const useLocalMobileMachine = () => useMachine(MobileMachine);

export const [MobileMachineProvider, useMobileMachine] = constate(
  useLocalMobileMachine,
);

export default MobileMachineProvider;
