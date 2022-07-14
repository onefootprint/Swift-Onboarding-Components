import { useMachine } from '@xstate/react';
import constate from 'constate';
import d2pMobileMachine from 'src/utils/state-machine';

const useLocalD2PMobileMachine = () => useMachine(d2pMobileMachine);

export const [D2PMobileMachineProvider, useD2PMobileMachine] = constate(
  useLocalD2PMobileMachine,
);

export default D2PMobileMachineProvider;
