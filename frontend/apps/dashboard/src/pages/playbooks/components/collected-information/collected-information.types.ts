import type { CountryRecord } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

export type SsnOption = {
  active: boolean;
  kind?: 'ssn9' | 'ssn4';
  optional?: boolean;
};

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
  ssn: SsnOption;
  usTaxIdAcceptable?: boolean;
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

  // Auth
  phoneOTP: boolean;
  emailOTP: boolean;
  emailAddress: boolean;
}>;
