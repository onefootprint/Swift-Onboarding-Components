import type { L10n } from '@onefootprint/footprint-js';
import type { IdvCompletePayload } from '@onefootprint/idv';
import type { IdDocOutcome, IdvBootstrapData, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  publicKey?: string;
  config?: PublicOnboardingConfig;
  validationToken?: string;
  bootstrapData?: IdvBootstrapData;
  showCompletionPage?: boolean;
  showLogo?: boolean;
  l10n?: L10n;
  idvCompletePayload?: IdvCompletePayload;
  isComponentsSdk?: boolean;
  sandboxOutcome?: {
    overallOutcome?: OverallOutcome;
    idDocOutcome?: IdDocOutcome;
  };
  sandboxId?: string;
};

export type MachineEvents =
  | {
      type: 'initContextUpdated';
      payload: {
        config?: PublicOnboardingConfig;
        bootstrapData?: IdvBootstrapData;
        showCompletionPage?: boolean;
        showLogo?: boolean;
        l10n?: L10n;
        authToken?: string;
        publicKey?: string;
        isComponentsSdk?: boolean;
        fixtureResult?: OverallOutcome;
        documentFixtureResult?: IdDocOutcome;
        sandboxId?: string;
      };
    }
  | { type: 'configRequestFailed' }
  | { type: 'initError' }
  | { type: 'sessionExpired' }
  | { type: 'reset' }
  | { type: 'idvComplete'; payload: IdvCompletePayload };
