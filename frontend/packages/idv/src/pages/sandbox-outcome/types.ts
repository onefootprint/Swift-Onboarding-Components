import type { IdDocOutcome, OverallOutcome } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID: string;
  outcomes: {
    overallOutcome: OverallOutcome;
    idDocOutcome: IdDocOutcome;
  };
};
