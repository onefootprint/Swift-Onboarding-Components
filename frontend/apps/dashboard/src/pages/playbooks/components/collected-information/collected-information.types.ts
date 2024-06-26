import type { CountryRecord } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

export type Option = Partial<{
  name: boolean;
  dob: boolean;
  email: boolean;
  fullAddress: boolean;
  idDocs: Record<string, unknown>;
  idDocKind: SupportedIdDocTypes[];
  countrySpecificIdDocKind: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
  phoneNumber: boolean;
  selfie: boolean;
  ssn: {
    active: boolean;
    kind?: string;
    optional?: boolean;
  };
  usLegalStatus: boolean;
  countriesRestrictions: CountryRecord[];
  internationalCountryRestrictions: CountryCode[] | null;
  businessName: boolean;
  businessAddress: boolean;
  businessTin: boolean;
  businessOwnersKyc: boolean;
  businessPhoneNumber: boolean;
  businessWebsite: boolean;
  businessType: boolean;
  businessDoingBusinessAs: boolean;
  businessBeneficialOwners: boolean;

  // AML
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
}>;
