import type { CountryCode, UsLegalStatus, VisaKind } from '@onefootprint/types';

export type FormData = {
  usLegalStatus: UsLegalStatus;
  nationality: CountrySelectOptionOrPlaceholder;
  citizenships?: CountrySelectOptionOrPlaceholder[];
  visa?: VisaFormData;
};

export type VisaFormData = {
  kind?: {
    label: string;
    value: VisaKind;
  };
  expirationDate?: string;
};

export type CountrySelectOptionOrPlaceholder = {
  label?: string;
  value?: CountryCode;
};
