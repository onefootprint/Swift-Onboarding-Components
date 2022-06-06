import { useActor } from '@xstate/react';
import constate from 'constate';
import useOnboardingMachine from 'src/pages/onboarding/hooks/use-onboarding-machine';
import { MachineEvents } from 'src/utils/state-machine/liveness-register';
import { Sender } from 'xstate';

const useLocalLivenessRegisterMachine = () => {
  const [state] = useOnboardingMachine();
  const actor: [any, Sender<MachineEvents>] = useActor(
    state.children.livenessRegister,
  );
  return actor;
};

export const [LivenessRegisterMachineProvider, useLivenessRegisterMachine] =
  constate(useLocalLivenessRegisterMachine);

export default LivenessRegisterMachineProvider;
