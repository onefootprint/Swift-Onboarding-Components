import { useActor } from '@xstate/react';
import constate from 'constate';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { MachineEvents } from 'src/utils/state-machine/onboarding/types';
import { Sender } from 'xstate';

const useLocalOnboardingMachine = () => {
  const [state] = useBifrostMachine();
  const actor: [any, Sender<MachineEvents>] = useActor(
    state.children.onboarding,
  );
  return actor;
};

export const [OnboardingMachineProvider, useOnboardingMachine] = constate(
  useLocalOnboardingMachine,
);

export default OnboardingMachineProvider;
