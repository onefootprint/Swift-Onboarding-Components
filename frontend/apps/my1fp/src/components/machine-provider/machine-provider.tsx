import { useMachine } from '@xstate/react';
import constate from 'constate';
import livenessCheckMachine from 'src/utils/state-machine/liveness-check/machine';

const useLocalLivenessCheckMachine = () => useMachine(livenessCheckMachine);

export const [LivenessCheckMachineProvider, useLivenessCheckMachine] = constate(
  useLocalLivenessCheckMachine,
);

export default LivenessCheckMachineProvider;
