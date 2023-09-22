import type { CountryRecord } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

export type Option = Partial<{
  name: boolean;
  dob: boolean;
  email: boolean;
  fullAddress: boolean;
  idDocs: any;
  idDocKind: SupportedIdDocTypes[];
  phoneNumber: boolean;
  selfie: boolean;
  ssn: {
    active: boolean;
    kind?: string;
    optional?: boolean;
  };
  usLegalStatus: boolean;
  countriesRestrictions: CountryRecord[];
  internationalCountryRestrictions: null | CountryCode[];
  ssnDocScanStepUp: boolean;

  // AML
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
}>;
