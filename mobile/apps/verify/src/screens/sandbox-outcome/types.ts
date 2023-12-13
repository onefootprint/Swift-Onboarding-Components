import type { OverallOutcome } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID: string;
  outcomes: {
    overallOutcome: {
      label: string;
      value: OverallOutcome;
      description?: string;
    };
  };
};
