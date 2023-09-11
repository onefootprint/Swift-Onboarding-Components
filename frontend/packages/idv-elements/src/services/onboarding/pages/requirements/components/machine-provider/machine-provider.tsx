import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { OnboardingRequirementsMachineArgs } from '../../utils/state-machine/machine';
import createOnboardingRequirementsMachine from '../../utils/state-machine/machine';

const useLocalOnboardingRequirementsMachine = (
  args: OnboardingRequirementsMachineArgs,
) => useMachine(() => createOnboardingRequirementsMachine(args));

export const [
  OnboardingRequirementsMachineProvider,
  useOnboardingRequirementsMachine,
] = constate(useLocalOnboardingRequirementsMachine);

export default OnboardingRequirementsMachineProvider;
