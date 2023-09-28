import type { DonePayload } from './pages/router';
import type { IdentifyMachineArgs } from './utils/state-machine';

export type IdentifyProps = IdentifyMachineArgs & {
  onDone: (payload: DonePayload) => void;
};
