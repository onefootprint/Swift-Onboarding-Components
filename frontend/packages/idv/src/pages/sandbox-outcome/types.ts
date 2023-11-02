import type { IdDocOutcome, OverallOutcome } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID: string;
  outcomes: {
    overallOutcome: {
      label: string;
      value: OverallOutcome;
    };
    idDocOutcome: {
      label: string;
      value: IdDocOutcome;
    };
  };
};
