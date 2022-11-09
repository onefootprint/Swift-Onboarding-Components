import { useActor } from '@xstate/react';
import constate from 'constate';
import useOnboardingMachine from 'src/hooks/use-onboarding-machine';
import {
  MachineContext,
  MachineEvents,
} from 'src/utils/state-machine/onboarding-requirements/types';
import { Sender, State } from 'xstate';

const useLocalOnboardingRequirementsMachine = () => {
  const [state] = useOnboardingMachine();
  const actor: [State<MachineContext>, Sender<MachineEvents>] = useActor(
    state.children.onboardingRequirements,
  );
  return actor;
};

export const [
  OnboardingRequirementsMachineProvider,
  useOnboardingRequirementsMachine,
] = constate(useLocalOnboardingRequirementsMachine);

export default OnboardingRequirementsMachineProvider;
