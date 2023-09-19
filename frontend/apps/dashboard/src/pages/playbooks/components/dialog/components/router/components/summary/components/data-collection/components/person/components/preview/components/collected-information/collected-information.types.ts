import type { CountryRecord } from '@onefootprint/global-constants';
import type { SupportedIdDocTypes } from '@onefootprint/types';

export type Option = Partial<{
  dob: boolean;
  email: boolean;
  fullAddress: boolean;
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
}>;
