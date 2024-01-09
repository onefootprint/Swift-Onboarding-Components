import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { MachineContext } from '../../utils/mobile-state-machine';
import createMobileMachine from '../../utils/mobile-state-machine';

type MobileMachineArgs = {
  initialContext: MachineContext;
};

const useLocalMobileMachine = ({ initialContext }: MobileMachineArgs) =>
  useMachine(() => createMobileMachine(initialContext));

export const [MobileMachineProvider, useMobileMachine] = constate(
  useLocalMobileMachine,
);

export default MobileMachineProvider;
