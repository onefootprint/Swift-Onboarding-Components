import type { L10nContextProviderProps } from '../../components/l10n-provider';
import type { DonePayload } from './pages/router';
import type { IdentifyMachineArgs } from './utils/state-machine';

export type IdentifyProps = IdentifyMachineArgs & {
  onDone: (payload: DonePayload) => void;
} & Pick<L10nContextProviderProps, 'l10n'>;
