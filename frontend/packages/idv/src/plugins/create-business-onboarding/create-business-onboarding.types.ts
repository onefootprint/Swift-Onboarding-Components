import type { OverallOutcome } from '@onefootprint/types';

export type SharedState = {
  authToken: string;
  kybFixtureResult?: OverallOutcome;
  onDone: () => void;
  onError: (error: unknown) => void;
};
