import type { FootprintOptions, L10n } from '@onefootprint/footprint-js';
import type { IdvBootstrapData } from '@onefootprint/types';

// Data passed from footprint-js SDK
export type BifrostProps = {
  userData?: IdvBootstrapData;
  options?: FootprintOptions;
  l10n?: L10n;
  authToken?: string;
  publicKey?: string;
};
