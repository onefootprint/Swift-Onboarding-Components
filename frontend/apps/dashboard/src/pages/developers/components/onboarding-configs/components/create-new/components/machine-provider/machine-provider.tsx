import { useMachine } from '@xstate/react';
import constate from 'constate';

import OnboardingConfigMachine from '../../utils/machine';

const useLocalOnboardingConfigMachine = () =>
  useMachine(OnboardingConfigMachine);

export const [OnboardingConfigMachineProvider, useOnboardingConfigMachine] =
  constate(useLocalOnboardingConfigMachine);

export default OnboardingConfigMachineProvider;
