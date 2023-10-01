import type { IdDocOutcomes, OverallOutcomes } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID: string;
  outcomes: {
    overallOutcome: OverallOutcomes;
    idDocOutcome: IdDocOutcomes;
  };
};
