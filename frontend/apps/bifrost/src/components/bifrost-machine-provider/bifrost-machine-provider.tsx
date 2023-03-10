import { useMachine } from '@xstate/react';
import constate from 'constate';

import BifrostMachine from '../../utils/state-machine/bifrost/machine';

const useLocalBifrostMachine = () => useMachine(BifrostMachine);

export const [BifrostMachineProvider, useBifrostMachine] = constate(
  useLocalBifrostMachine,
);

export default BifrostMachineProvider;
