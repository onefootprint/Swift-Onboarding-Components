import type { OverallOutcome } from '@onefootprint/types';
import type { BootstrapBusinessData, BootstrapUserData } from '../../types';

export type SharedState = {
  authToken: string;
  kybFixtureResult?: OverallOutcome;
  bootstrapUserData: BootstrapUserData;
  bootstrapBusinessData: BootstrapBusinessData;
  onDone: () => void;
  onError: (error: unknown) => void;
};
