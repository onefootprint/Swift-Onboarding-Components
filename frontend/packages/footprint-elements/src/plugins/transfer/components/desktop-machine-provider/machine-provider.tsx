import { useMachine } from '@xstate/react';
import constate from 'constate';

import DesktopMachine from '../../utils/desktop-state-machine/machine';

const useLocalDesktopMachine = () => useMachine(DesktopMachine);

export const [DesktopMachineProvider, useDesktopMachine] = constate(
  useLocalDesktopMachine,
);

export default DesktopMachineProvider;
