import type { IdDocOutcome, OverallOutcome } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID?: string;
  outcomes: {
    overallOutcome: {
      label: string;
      value: OverallOutcome;
      description?: string;
    };
    idDocOutcome: {
      label: string;
      value: IdDocOutcome;
    };
  };
};
