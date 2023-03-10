import { useMachine } from '@xstate/react';
import constate from 'constate';
import createOnboardingMachine, {
  OnboardingMachineArgs,
} from 'src/utils/state-machine/onboarding/machine';

const useLocalOnboardingMachine = (args: OnboardingMachineArgs) =>
  useMachine(() => createOnboardingMachine(args));

export const [OnboardingMachineProvider, useOnboardingMachine] = constate(
  useLocalOnboardingMachine,
);

export default OnboardingMachineProvider;
