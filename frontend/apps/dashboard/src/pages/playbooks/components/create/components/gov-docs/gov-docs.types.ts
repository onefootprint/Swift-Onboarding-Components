import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

export type GovDocsFormData = {
  gov: {
    global: SupportedIdDocTypes[];
    country: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
    selfie: boolean;
    idDocFirst: boolean;
  };
};
