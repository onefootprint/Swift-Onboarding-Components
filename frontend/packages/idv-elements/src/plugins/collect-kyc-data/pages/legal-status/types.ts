import { CountrySelectOption } from '@onefootprint/ui';

export type FormData = {
  usLegalStatus: 'citizen' | 'permanentResident' | 'visa';
  nationality?: CountrySelectOption;
  citizenships?: CountrySelectOption[];
  visa?: {
    kind: { label: string; value: string };
    expirationDate: string;
  };
};
