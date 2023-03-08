import { useMachine } from '@xstate/react';
import constate from 'constate';

import collectKybDataMachine from '../../utils/state-machine/machine';

const useLocalCollectKybDataMachine = () => useMachine(collectKybDataMachine);

export const [MachineProvider, useCollectKybDataMachine] = constate(
  useLocalCollectKybDataMachine,
);

export default MachineProvider;
