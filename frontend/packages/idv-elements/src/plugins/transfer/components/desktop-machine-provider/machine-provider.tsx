import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { MachineContext } from '../../utils/desktop-state-machine';
import createDesktopMachine from '../../utils/desktop-state-machine';

type DesktopMachineArgs = {
  initialContext: MachineContext;
};

const useLocalDesktopMachine = ({ initialContext }: DesktopMachineArgs) =>
  useMachine(() => createDesktopMachine(initialContext));

export const [DesktopMachineProvider, useDesktopMachine] = constate(
  useLocalDesktopMachine,
);

export default DesktopMachineProvider;
