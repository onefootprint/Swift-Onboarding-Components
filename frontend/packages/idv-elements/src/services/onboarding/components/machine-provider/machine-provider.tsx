import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { OnboardingMachineArgs } from '../../utils/state-machine';
import createOnboardingMachine from '../../utils/state-machine';

const useLocalOnboardingMachine = (args: OnboardingMachineArgs) =>
  useMachine(() => createOnboardingMachine(args));

export const [OnboardingMachineProvider, useOnboardingMachine] = constate(
  useLocalOnboardingMachine,
);

export default OnboardingMachineProvider;
