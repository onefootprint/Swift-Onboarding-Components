import { useActor } from '@xstate/react';
import constate from 'constate';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

const useLocalLivenessRegisterMachine = () => {
  const [state] = useBifrostMachine();
  return useActor(state.children.livenessRegister);
};

export const [LivenessRegisterMachineProvider, useLivenessRegisterMachine] =
  constate(useLocalLivenessRegisterMachine);

export default LivenessRegisterMachineProvider;
