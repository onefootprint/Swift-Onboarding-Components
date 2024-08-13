import { IdDocOutcome, IdVerificationOutcome, OverallOutcome } from '@onefootprint/types';

export type SandboxOutcomeFormData = {
  testID?: string;
  overallOutcome: OverallOutcome;
  docVerificationOutcome: IdVerificationOutcome;
  idDocOutcome: IdDocOutcome | undefined;
};
