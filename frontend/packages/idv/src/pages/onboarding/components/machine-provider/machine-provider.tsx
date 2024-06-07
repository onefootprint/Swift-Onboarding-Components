import type { L10n } from '@onefootprint/footprint-js';
import { useMachine } from '@xstate/react';
import constate from 'constate';

import type { OnboardingMachineArgs } from '../../utils/state-machine';
import createOnboardingMachine from '../../utils/state-machine';

type OnboardingMachineProviderArgs = {
  args: OnboardingMachineArgs;
  l10n?: L10n;
};

const useLocalOnboardingMachine = ({ args, l10n }: OnboardingMachineProviderArgs) =>
  useMachine(() => createOnboardingMachine(args, l10n));

export const [OnboardingMachineProvider, useOnboardingMachine] = constate(useLocalOnboardingMachine);

export default OnboardingMachineProvider;
