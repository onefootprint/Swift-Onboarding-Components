import { useActor } from '@xstate/react';
import constate from 'constate';
import useOnboardingMachine from 'src/hooks/use-onboarding-machine';
import { MachineEvents } from 'src/utils/state-machine/onboarding-requirements/types';
import { Sender } from 'xstate';

const useLocalOnboardingRequirementsMachine = () => {
  const [state] = useOnboardingMachine();
  const actor: [any, Sender<MachineEvents>] = useActor(
    state.children.onboardingRequirements,
  );
  return actor;
};

export const [
  OnboardingRequirementsMachineProvider,
  useOnboardingRequirementsMachine,
] = constate(useLocalOnboardingRequirementsMachine);

export default OnboardingRequirementsMachineProvider;
