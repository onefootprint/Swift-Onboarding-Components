import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';

export type GovDocsFormData = {
  gov: {
    global: IdDocKind[];
    country: CountrySpecificDocumentMapping;
    selfie: boolean;
    idDocFirst: boolean;
  };
};
