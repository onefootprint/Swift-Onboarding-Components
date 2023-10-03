import type { L10nContextProviderProps } from '../../components/l10n-provider';
import type { DonePayload } from './pages/router';
import type { OnboardingMachineArgs } from './utils/state-machine';

export type OnboardingProps = OnboardingMachineArgs & {
  onDone: (payload: DonePayload) => void;
} & Pick<L10nContextProviderProps, 'l10n'>;
