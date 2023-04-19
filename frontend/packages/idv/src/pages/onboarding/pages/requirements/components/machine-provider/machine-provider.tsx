import { useMachine } from '@xstate/react';
import constate from 'constate';

import createOnboardingRequirementsMachine, {
  OnboardingRequirementsMachineArgs,
} from '../../utils/state-machine/machine';

const useLocalOnboardingRequirementsMachine = (
  args: OnboardingRequirementsMachineArgs,
) => useMachine(() => createOnboardingRequirementsMachine(args));

export const [
  OnboardingRequirementsMachineProvider,
  useOnboardingRequirementsMachine,
] = constate(useLocalOnboardingRequirementsMachine);

export default OnboardingRequirementsMachineProvider;
