import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { MachineContext } from '../../utils/state-machine';
import { createLivenessMachine } from '../../utils/state-machine/machine';

type MachineArgs = {
  initialContext: MachineContext;
};

const useLocalLivenessMachine = ({ initialContext }: MachineArgs) =>
  useMachine(() => createLivenessMachine(initialContext));

export const [MachineProvider, useLivenessMachine] = constate(useLocalLivenessMachine);

export default MachineProvider;
