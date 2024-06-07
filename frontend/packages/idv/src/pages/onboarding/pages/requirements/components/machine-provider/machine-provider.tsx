import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { OnboardingRequirementsMachineArgs } from '../../utils/state-machine/machine';
import createOnboardingRequirementsMachine from '../../utils/state-machine/machine';

type OnboardingRequirementsMachineProviderArgs = {
  args: OnboardingRequirementsMachineArgs;
};

const useLocalOnboardingRequirementsMachine = ({ args }: OnboardingRequirementsMachineProviderArgs) =>
  useMachine(() => createOnboardingRequirementsMachine(args));

export const [OnboardingRequirementsMachineProvider, useOnboardingRequirementsMachine] = constate(
  useLocalOnboardingRequirementsMachine,
);

export default OnboardingRequirementsMachineProvider;
