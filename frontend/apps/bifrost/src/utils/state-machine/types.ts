import type { L10n } from '@onefootprint/footprint-js';
import type {
  IdvBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
  publicKey?: string;
  config?: PublicOnboardingConfig;
  validationToken?: string;
  bootstrapData?: IdvBootstrapData;
  showCompletionPage?: boolean;
  showLogo?: boolean;
  l10n?: L10n;
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
      };
    }
  | { type: 'configRequestFailed' }
  | { type: 'initError' }
  | { type: 'reset' };
